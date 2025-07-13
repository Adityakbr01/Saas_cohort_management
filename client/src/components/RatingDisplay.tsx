import { Star } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface RatingProps {
    averageRating: number
    totalRatings: number
    ratingsDistribution?: {
        1: number
        2: number
        3: number
        4: number
        5: number
    }
}

export default function RatingDisplay({
    averageRating,
    totalRatings,
    ratingsDistribution,
}: RatingProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default" aria-label={`Rating: ${averageRating}`}>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">{averageRating?.toFixed(1) ?? "0.0"}</span>
                    <span className="text-xs text-muted-foreground ml-1">({totalRatings ?? 0})</span>
                </div>
            </TooltipTrigger>

            <TooltipContent className="bg-background  [&>[data-radix-popper-arrow]]:hidden border overflow-hidden rounded-xl shadow-md p-4 text-sm space-y-1" align="start" >
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >

                    <div className="mb-2 font-medium text-muted-foreground">Rating Breakdown</div>
                    {ratingsDistribution &&
                        Object.entries(ratingsDistribution)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .map(([star, count]) => (
                                <div key={star} className="flex justify-between w-40 text-muted-foreground">
                                    <span className="text-xs flex items-center gap-0.5">
                                        {star}
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </span>
                                    <span className="text-xs">{count}</span>
                                </div>
                            ))}


                </motion.div>
            </TooltipContent>
        </Tooltip>
    )
}
