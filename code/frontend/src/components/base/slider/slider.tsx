"use client";

import { Slider as AriaSlider, SliderThumb, SliderTrack } from "react-aria-components";

export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps {
  value?: number | number[];
  onChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: SliderSize;
  isDisabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 50000000,
  step = 50000,
  size = "md",
  isDisabled = false,
  className = "",
}: SliderProps) {
  const ariaValue = value !== undefined ? value : [min, max];

  const handleAriaChange = (val: number | number[]) => {
    if (onChange) {
      onChange(val);
    }
  };

  const isRange = Array.isArray(ariaValue);

  return (
    <AriaSlider
      value={ariaValue}
      onChange={handleAriaChange}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={isDisabled}
      className={`w-full flex flex-col gap-2 ${className}`}
    >
      <div className="relative w-full flex items-center select-none touch-none py-2">
        <SliderTrack className="relative w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 cursor-pointer">
          {({ state }) => {
            const getPercent = (val: number) => ((val - min) / (max - min)) * 100;
            const left = isRange ? getPercent((ariaValue as number[])[0]) : 0;
            const right = isRange ? getPercent((ariaValue as number[])[1]) : getPercent(ariaValue as number);
            
            return (
              <>
                <div
                  className="absolute h-full rounded-full bg-violet-600 dark:bg-violet-500"
                  style={{
                    left: `${left}%`,
                    width: `${right - left}%`,
                  }}
                />
                
                {isRange ? (
                  <>
                    <SliderThumb
                      index={0}
                      className="w-5 h-5 rounded-full bg-white border-2 border-violet-600 dark:border-violet-500 shadow-md hover:scale-115 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-grab active:cursor-grabbing"
                    />
                    <SliderThumb
                      index={1}
                      className="w-5 h-5 rounded-full bg-white border-2 border-violet-600 dark:border-violet-500 shadow-md hover:scale-115 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-grab active:cursor-grabbing"
                    />
                  </>
                ) : (
                  <SliderThumb
                    className="w-5 h-5 rounded-full bg-white border-2 border-violet-600 dark:border-violet-500 shadow-md hover:scale-115 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-grab active:cursor-grabbing"
                  />
                )}
              </>
            );
          }}
        </SliderTrack>
      </div>
    </AriaSlider>
  );
}
