import { TitleBar } from "@/components/title-bar";
import { BraidChat } from "@/components/braid/braid-chat";

export const metadata = {
  title: "Braid — Laboratory for Cybernetics",
  description: "Ask questions of the Re-Braiding symposium archive and get answers with sources.",
};

export default function BraidPage() {
  return (
    <div className="pb-20">
      <TitleBar
        title="Braid"
        description="Ask a question about the Re-Braiding symposia. Every answer links back to who said it and where."
      />
      <BraidChat />
    </div>
  );
}
