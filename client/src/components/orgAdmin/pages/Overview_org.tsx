import {useState} from "react";
import {Link} from "react-router-dom";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {BookOpen, DollarSign, UserCog, UserPlus, Users} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

const Overview_org: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newMentor, setNewMentor] = useState({
        name: "",
        email: ""
    });

    const handleAddMentor = () => {
        // In a real application, you would make an API call to save the new mentor
        console.log("Adding new mentor:", newMentor);
        setIsDialogOpen(false);
        setNewMentor({
            name: "",
            email: ""
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Welcome to your comprehensive Org admin dashboard. Monitor key metrics and manage your Cohorts
                    and Mentors.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cohorts</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mentors</CardTitle>
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground">+5 since last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Cohort and Mentor Management Tabs */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Cohort & Mentor Management</CardTitle>
                    <CardDescription>
                        View and manage all cohorts and mentors from one centralized location
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="cohorts" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
                            <TabsTrigger value="mentors">Mentors</TabsTrigger>
                        </TabsList>
                        <TabsContent value="cohorts" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Active Cohorts</h3>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cohort Name</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Web Development Bootcamp</TableCell>
                                        <TableCell>Mar 01, 2025</TableCell>
                                        <TableCell>Jun 30, 2025</TableCell>
                                        <TableCell>24</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-500">Active</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/cohorts/1">Manage</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Data Science Immersive</TableCell>
                                        <TableCell>Apr 15, 2025</TableCell>
                                        <TableCell>Aug 15, 2025</TableCell>
                                        <TableCell>18</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-500">Active</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/cohorts/2">Manage</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">UX/UI Design Fundamentals</TableCell>
                                        <TableCell>Feb 10, 2025</TableCell>
                                        <TableCell>May 10, 2025</TableCell>
                                        <TableCell>16</TableCell>
                                        <TableCell>
                                            <Badge className="bg-yellow-500">Ending Soon</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/cohorts/3">Manage</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <div className="flex justify-end">
                                <Button variant="outline" asChild>
                                    <Link to="/cohorts">View All Cohorts</Link>
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="mentors" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Active Mentors</h3>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add New Mentor
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Mentor</DialogTitle>
                                            <DialogDescription>
                                                Enter the details for the new mentor. All fields are required.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={newMentor.name}
                                                    onChange={(e) =>
                                                        setNewMentor({ ...newMentor, name: e.target.value })
                                                    }
                                                    className="col-span-3"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="email" className="text-right">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={newMentor.email}
                                                    onChange={(e) =>
                                                        setNewMentor({ ...newMentor, email: e.target.value })
                                                    }
                                                    className="col-span-3"
                                                    required
                                                />
                                            </div>

                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => setIsDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleAddMentor}
                                                disabled={
                                                    !newMentor.name || !newMentor.email
                                                }
                                            >
                                                Request to Add Mentor
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Expertise</TableHead>
                                        <TableHead>Assigned Cohorts</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Sarah Johnson</TableCell>
                                        <TableCell>Full-Stack Development</TableCell>
                                        <TableCell>2</TableCell>
                                        <TableCell>15</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-500">Active</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/mentors/1">Profile</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Michael Chen</TableCell>
                                        <TableCell>Data Science</TableCell>
                                        <TableCell>1</TableCell>
                                        <TableCell>8</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-500">Active</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/mentors/2">Profile</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Priya Patel</TableCell>
                                        <TableCell>UX/UI Design</TableCell>
                                        <TableCell>1</TableCell>
                                        <TableCell>16</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-500">Active</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/mentors/3">Profile</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <div className="flex justify-end">
                                <Button variant="outline" asChild>
                                    <Link to="/mentors">View All Mentors</Link>
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Overview_org;