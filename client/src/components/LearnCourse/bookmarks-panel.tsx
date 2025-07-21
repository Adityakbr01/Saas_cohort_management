
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookmarkCheck, Play, FileText, BookOpen, Folder } from "lucide-react"
import type { BookmarkedItem, BookmarkedType } from "@/types/cohort"


interface BookmarkedSelectItem {
  id: string;
  title: string;
  type: BookmarkedType;
}

interface BookmarksPanelProps {
  bookmarks: BookmarkedItem[]
  onItemSelect: (item: BookmarkedSelectItem) => void
}

export default function BookmarksPanel({ bookmarks, onItemSelect }: BookmarksPanelProps) {
  const getTypeIcon = (type: BookmarkedType) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />
      case "quiz":
        return <FileText className="h-4 w-4 text-green-500" />
      case "assignment":
        return <BookOpen className="h-4 w-4 text-purple-500" />
      case "reading":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "chapter":
        return <Folder className="h-4 w-4 text-gray-500" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const groupedBookmarks = bookmarks.reduce(
    (acc, bookmark) => {
      const category = bookmark.type === "chapter" ? "Chapters" : "Lessons"
      if (!acc[category]) acc[category] = []
      acc[category].push(bookmark)
      return acc
    },
    {} as Record<string, BookmarkedItem[]>,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookmarkCheck className="h-4 w-4 text-amber-600" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Saved Items</h3>
      </div>

      {bookmarks.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedBookmarks).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{category}</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:bg-amber-50/50 border-amber-200/50"
                    onClick={() => onItemSelect({ id: item.id, title: item.title, type: item.type })}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getTypeIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            <BookmarkCheck className="h-3 w-3 text-amber-600" />
                          </div>
                          {item.chapterTitle && (
                            <p className="text-xs text-muted-foreground mb-2">{item.chapterTitle}</p>
                          )}
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <BookmarkCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No bookmarked items</p>
            <p className="text-muted-foreground text-xs mt-1">Bookmark lessons and chapters to access them quickly</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {bookmarks.length > 0 && (
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-800">{bookmarks.length}</div>
              <div className="text-xs text-amber-600">Saved Items</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
