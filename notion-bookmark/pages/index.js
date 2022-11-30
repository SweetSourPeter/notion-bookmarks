// 1
import { Client } from '@notionhq/client'
import { useEffect, useState } from 'react'

// 2
export default function Home() {
  // 3
  const [pageData, setPageData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url
        const title = tabs[0].title
        setPageData({ url, title })
        console.log(tabs[0])
        console.log("URL from main.js", url);
      })
  }, [])

  async function saveBookmarkToNotion(bookmark) {
    // todo
      // 1
    const notion = new Client({
      auth: process.env.NEXT_PUBLIC_NOTION_API_TOKEN,
    })

    try {
      // 2
      await notion.pages.create({
        parent: {
          database_id: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID,
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: bookmark.title,
                },
              },
            ],
          },
          URL: {
            url: bookmark.url,
          },
          Tags: {
            multi_select: bookmark.tags,
          },
          Notes: {
            rich_text: [
              {
                text: {
                  content: bookmark.notes || '-',
                },
              },
            ],
          },
        },
      })
      return true
    } catch (error) {
      return false
    }
  }

  async function handleSubmit(e) {
    // todo
    e.preventDefault()
    setIsSaving(true)
  
    // 1
    const data = new FormData(e.target)
    const bookmark = Object.fromEntries(data.entries())
  
    // 2
    bookmark.tags = bookmark.tags
      .split(',')
      .filter((tag) => tag.trim().length !== 0)
      .map((tag) => ({
        name: tag.trim(),
      }))
  
    // 3
    const result = await saveBookmarkToNotion(bookmark)
  
    // 4
    if (result) {
      setIsSaved(true)
    } else {
      setIsSaving(false)
    }
  }
  // 4
  return (
    <div>
      <div>
        <h1>Save to Notion Bookmarks</h1>
      </div>
      <div>
        {isSaved ? (
          <span>Saved</span>
        ) : (
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title</label>
              <input name="title" type="text" defaultValue={pageData.title} title={pageData.title} required />
            </div>
            <div>
              <label>URL</label>
              <input name="url" type="url" defaultValue={pageData.url} title={pageData.url} required />
            </div>
            <div>
              <label>Languages</label>
              <input name="languages" type="text" />
              <small>Separate Languages with Commas</small>
            </div>
            <div>
              <label>Tags</label>
              <input name="tags" type="text" />
              <small>Separate Tags with Commas</small>
            </div>
            <div>
              <label>Notes</label>
              <input name="notes" as="textarea" rows={3} />
            </div>
            <div>
              <button type="submit" disabled={isSaving}>
                {isSaving ? <span>Saving</span> : <span>Save</span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}