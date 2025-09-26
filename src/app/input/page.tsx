// src/app/input/page.tsx
// 9ステップ入力フォームのメインページ
// ProgressBar + InputForm + DataContextを組み合わせた入力フロー管理
// 関連: components/ProgressBar.tsx, components/InputForm.tsx, contexts/DataContext.tsx

"use client";

import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { INPUT_STEPS } from '@/types/moneycheck';
import ProgressBar from '@/components/ProgressBar';
import InputForm from '@/components/InputForm';

export default function InputPage() {
  const router = useRouter();
  const { userData, updateUserData, currentStep, setCurrentStep } = useData();

  const currentStepData = INPUT_STEPS[currentStep - 1];
  const totalSteps = INPUT_STEPS.length;

  const handleValueChange = (value: number) => {
    updateUserData(currentStepData.id, value);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // 最後のステップ → 結果ページへ
      router.push('/result');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentValue = userData[currentStepData.id];
  const canGoBack = currentStep > 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-screen bg-background px-4 py-8 page-transition">
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        <InputForm
          step={currentStepData}
          value={currentValue}
          onValueChange={handleValueChange}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={canGoBack}
          isLastStep={isLastStep}
        />
      </div>
    </div>
  );
}