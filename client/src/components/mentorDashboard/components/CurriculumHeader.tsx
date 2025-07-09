import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save } from "lucide-react";

// Header Component
const CurriculumHeader: React.FC<{
    cohortName: string;
    onBack: () => void;
}> = ({ cohortName, onBack }) => (
    <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cohort
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
                <h1 className="text-3xl font-bold">Curriculum Builder</h1>
                <p className="text-muted-foreground">{cohortName}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
            </Button>
            <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
            </Button>
        </div>
    </div>
);

export default CurriculumHeader;
