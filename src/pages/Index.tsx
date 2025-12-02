import { MultiStepForm } from "@/components/MultiStepForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background glow-borders flex flex-col">
      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <MultiStepForm />
      </main>
    </div>
  );
};

export default Index;
