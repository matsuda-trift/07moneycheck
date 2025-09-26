// src/components/InputForm.tsx
// 入力フォームコンポーネント（バリデーション・エラーハンドリング付き）
// 数値入力のバリデーションと例示情報を含む単一責任コンポーネント
// 関連: app/input/page.tsx, types/moneycheck.ts, components/ProgressBar.tsx

"use client";

import { useState, useEffect, memo, useCallback } from 'react';
import { InputStep } from '@/types/moneycheck';

interface InputFormProps {
  step: InputStep;
  value: number;
  onValueChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

function InputForm({
  step,
  value,
  onValueChange,
  onNext,
  onBack,
  canGoBack,
  isLastStep
}: InputFormProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState('');

  // valueプロップが変更された時にinputValueを更新
  useEffect(() => {
    setInputValue(value > 0 ? formatNumber(value) : '');
  }, [value]);

  const validateInput = (val: string): boolean => {
    const cleanVal = val.replace(/,/g, ''); // カンマを削除して検証

    if (cleanVal === '') {
      setError('金額を入力してください');
      return false;
    }

    const numValue = parseInt(cleanVal, 10);
    if (isNaN(numValue)) {
      setError('数値を入力してください');
      return false;
    }

    if (numValue < 0) {
      setError('マイナス値は入力できません');
      return false;
    }

    if (numValue > 100000000) {
      setError('金額が大きすぎます');
      return false;
    }

    setError('');
    return true;
  };

  const formatNumber = useCallback((num: number): string => {
    return num.toLocaleString('ja-JP');
  }, []);

  const extractNumberFromExample = useCallback((example: string): number => {
    const match = example.match(/(\d{1,3}(?:,\d{3})*|\d+)円/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, ''); // 数値のみ許可
    const formattedVal = val ? formatNumber(parseInt(val, 10)) : '';
    setInputValue(formattedVal);

    if (val && validateInput(val)) {
      onValueChange(parseInt(val, 10));
    }
  }, [formatNumber, onValueChange]);

  const handleNext = useCallback(() => {
    if (validateInput(inputValue)) {
      onNext();
    }
  }, [inputValue, onNext]);

  const handleExampleClick = useCallback((example: string) => {
    const value = extractNumberFromExample(example);
    const formattedValue = value > 0 ? formatNumber(value) : '0';
    setInputValue(formattedValue);
    onValueChange(value);
    setError('');
  }, [extractNumberFromExample, formatNumber, onValueChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error && inputValue) {
      handleNext();
    }
    if (e.key === 'Escape' && canGoBack) {
      onBack();
    }
  }, [error, inputValue, handleNext, canGoBack, onBack]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-4 text-center">
          {step.title}
        </h1>
        <p className="text-muted text-center mb-6">
          {step.description}
        </p>

        <div className="relative mb-4">
          <label htmlFor={`input-${step.id}`} className="sr-only">
            {step.title}の入力欄
          </label>
          <input
            id={`input-${step.id}`}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={formatNumber(parseInt(step.placeholder))}
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? `error-${step.id}` : undefined}
            className={`w-full px-4 py-3 text-lg text-center border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
              error
                ? 'border-red-500 bg-red-50'
                : 'border-border bg-white focus:border-primary focus:shadow-lg'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            {step.unit}
          </span>
        </div>

        {error && (
          <p id={`error-${step.id}`} className="text-red-500 text-sm text-center mb-4" role="alert">
            {error}
          </p>
        )}

      </div>

      <div className="mb-8">
        <p className="text-sm text-muted mb-3 text-center">参考例：</p>
        <div className="grid gap-2">
          {step.examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="bg-secondary hover:bg-border px-3 py-2 rounded text-sm text-center transition-colors cursor-pointer"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border text-foreground hover:bg-secondary"
        >
          戻る
        </button>
        <button
          onClick={handleNext}
          disabled={!inputValue || !!error}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastStep ? '診断結果を見る' : '次へ'}
        </button>
      </div>
    </div>
  );
}

export default memo(InputForm);