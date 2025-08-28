import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Briefcase } from "lucide-react";

interface SessionSetupProps {
  scenario: string;
  onStart: (setupData: {
    resume?: string;
    jobDescription?: string;
    experienceLevel: string;
    targetRole?: string;
  }) => void;
}

export default function SessionSetup({ scenario, onStart }: SessionSetupProps) {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'job') => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (type === 'resume') {
          setResume(content);
        } else {
          setJobDescription(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleStart = () => {
    setIsLoading(true);
    onStart({
      resume: resume.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
      experienceLevel,
      targetRole: targetRole.trim() || undefined,
    });
  };

  const canStart = experienceLevel && (scenario !== 'Interviews' || resume || jobDescription);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Session Setup - {scenario}
          </CardTitle>
          <CardDescription>
            Provide your background information to get personalized questions and feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="experience">Experience Level *</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                <SelectItem value="executive">Executive/C-Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Role */}
          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role (Optional)</Label>
            <Input
              id="targetRole"
              placeholder="e.g., Senior Software Engineer, Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          {/* Resume Section */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume/Background {scenario === 'Interviews' && '*'}
            </Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Text File
                </Button>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'resume')}
                />
              </div>
              <Textarea
                placeholder="Paste your resume or key background information here..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                rows={6}
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">
                Include your key experiences, skills, and achievements. This helps generate relevant questions.
              </p>
            </div>
          </div>

          {/* Job Description Section */}
          {scenario === 'Interviews' && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Description (Optional but Recommended)
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('job-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Text File
                  </Button>
                  <input
                    id="job-upload"
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'job')}
                  />
                </div>
                <Textarea
                  placeholder="Paste the job description you're preparing for..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  The job description helps generate questions specific to the role requirements.
                </p>
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="pt-4">
            <Button 
              onClick={handleStart} 
              disabled={!canStart || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Generating Questions..." : `Start ${scenario} Practice`}
            </Button>
            {!canStart && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {!experienceLevel 
                  ? "Please select your experience level" 
                  : scenario === 'Interviews' && !resume && !jobDescription
                  ? "Please provide your resume or job description for personalized questions"
                  : ""
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">💡 Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• More detailed background = more personalized questions</li>
              <li>• Include specific technologies, projects, and achievements</li>
              <li>• Job descriptions help generate role-specific scenarios</li>
              <li>• Your information is only used for this session</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
