'use client';

import React, { useRef } from 'react';
import styles from './QuantityStepper.module.css';

interface Props {
    id?: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
}

const QuantityStepper: React.FC<Props> = ({ id, value, onChange, min = 1 }) => {
    // Keep a ref so setInterval always reads the latest value (avoids stale closure)
    const valueRef = useRef(value);
    valueRef.current = value;

    const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isLongPressRef = useRef(false);

    const change = (delta: number) => {
        onChange(Math.max(min, valueRef.current + delta));
    };

    const startPress = (delta: number) => {
        isLongPressRef.current = false;
        pressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            pressIntervalRef.current = setInterval(() => change(delta), 80);
        }, 400);
    };

    const stopPress = () => {
        if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
        if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp' || e.key === '+') {
            e.preventDefault();
            onChange(Math.max(min, value + 1));
        } else if (e.key === 'ArrowDown' || e.key === '-') {
            e.preventDefault();
            onChange(Math.max(min, value - 1));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === '') { onChange(0); return; }
        const n = parseInt(raw, 10);
        if (!isNaN(n) && n >= min) onChange(n);
    };

    const handleBlur = () => {
        if (value < min) onChange(min);
    };

    return (
        <div className={styles.stepper}>
            <button
                type="button"
                className={styles.btn}
                onMouseDown={() => startPress(-1)}
                onMouseUp={stopPress}
                onMouseLeave={stopPress}
                onTouchStart={(e) => { e.preventDefault(); startPress(-1); }}
                onTouchEnd={stopPress}
                onClick={() => { if (!isLongPressRef.current) change(-1); }}
                disabled={value <= min}
                aria-label="Reducir cantidad"
            >
                −
            </button>
            <input
                id={id}
                type="number"
                className={styles.input}
                value={value || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                min={min}
                placeholder={String(min)}
                aria-label="Cantidad"
            />
            <button
                type="button"
                className={styles.btn}
                onMouseDown={() => startPress(1)}
                onMouseUp={stopPress}
                onMouseLeave={stopPress}
                onTouchStart={(e) => { e.preventDefault(); startPress(1); }}
                onTouchEnd={stopPress}
                onClick={() => { if (!isLongPressRef.current) change(1); }}
                aria-label="Aumentar cantidad"
            >
                +
            </button>
        </div>
    );
};

export default QuantityStepper;
