import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, ChevronUp, ChevronDown } from "lucide-react";

export default function FeedbackCard() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [ease, setEase] = useState("");
  const [feature, setFeature] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          ease,
          feature,
          feedback,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      setSubmitted(true);
    } catch (err: any) {
      setError("Sorry, something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md mx-auto pointer-events-auto">
        <div className="flex justify-center">
          <button
            className="rounded-t-xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white w-full flex items-center justify-between px-4 py-3 text-lg font-semibold shadow-lg focus:outline-none"
            aria-expanded={open}
            aria-controls="feedback-card-content"
            onClick={() => setOpen((v) => !v)}
          >
            <span>Help us improve your AR shopping experience</span>
            {open ? <ChevronDown className="ml-2" /> : <ChevronUp className="ml-2" />}
          </button>
        </div>
        {open && (
          <Card id="feedback-card-content" className="rounded-t-none rounded-b-xl border-t-0 shadow-xl animate-fade-in bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Help us improve your AR shopping experience</CardTitle>
              <CardDescription>Your feedback helps us make our demo better</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-semibold text-lg mb-1">Thank you for your feedback!</div>
                  <div className="text-muted-foreground text-sm">We appreciate your input.</div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <div className="font-medium mb-1">Are you more confident in purchasing after visualizing the asset in 3D?</div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
                          onClick={() => setRating(star)}
                        >
                          <Star fill={rating >= star ? '#facc15' : 'none'} className="w-7 h-7" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">How easy was it to use the 3D asset generation tool?</div>
                    <RadioGroup value={ease} onValueChange={setEase} className="flex flex-wrap gap-2">
                      <RadioGroupItem value="very-easy" id="very-easy" />
                      <label htmlFor="very-easy" className="mr-2">Very easy</label>
                      <RadioGroupItem value="easy" id="easy" />
                      <label htmlFor="easy" className="mr-2">Easy</label>
                      <RadioGroupItem value="neutral" id="neutral" />
                      <label htmlFor="neutral" className="mr-2">Neutral</label>
                      <RadioGroupItem value="difficult" id="difficult" />
                      <label htmlFor="difficult" className="mr-2">Difficult</label>
                      <RadioGroupItem value="very-difficult" id="very-difficult" />
                      <label htmlFor="very-difficult">Very difficult</label>
                    </RadioGroup>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Which feature was most valuable to you?</div>
                    <RadioGroup value={feature} onValueChange={setFeature} className="flex flex-col gap-1">
                      <div className="flex items-center">
                        <RadioGroupItem value="text-3d" id="text-3d" />
                        <label htmlFor="text-3d" className="ml-2">Text to 3D generation</label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="image-3d" id="image-3d" />
                        <label htmlFor="image-3d" className="ml-2">Image to 3D generation</label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="ar-preview" id="ar-preview" />
                        <label htmlFor="ar-preview" className="ml-2">AR preview in my space</label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="customization" id="customization" />
                        <label htmlFor="customization" className="ml-2">Model customization</label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <label htmlFor="feedback-text" className="font-medium mb-1 block">Any other feedback or suggestions?</label>
                    <Textarea
                      id="feedback-text"
                      placeholder="Share your thoughts on how we can improve..."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                  <Button type="submit" className="w-full mt-2 py-3 text-base rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 