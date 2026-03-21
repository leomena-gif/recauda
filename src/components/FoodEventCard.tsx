'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './FoodEventCard.module.css';
import Card from './Card';

interface FoodEventCardProps {
    id?: string;
    title?: string;
    endDate?: string;
    dishes?: Array<{ name: string; price: number; sold?: number; total?: number }>;
}

const FoodEventCard: React.FC<FoodEventCardProps> = ({
    id = '1',
    title = 'Venta de comida - Platos especiales',
    endDate = '20 de diciembre de 2025',
    dishes = [
        { name: 'Milanesa con papas', price: 2500, sold: 45, total: 100 },
        { name: 'Empanadas (docena)', price: 3000, sold: 30, total: 80 },
    ],
}) => {
    const router = useRouter();

    const handleCardClick = () => {
        router.push('/event-detail?id=' + id);
    };

    // Calculate totals
    const totalRevenue = dishes.reduce((sum, dish) => sum + ((dish.sold ?? 0) * dish.price), 0);
    const totalGoal = dishes.reduce((sum, dish) => sum + ((dish.total ?? 0) * dish.price), 0);
    const overallProgress = totalGoal > 0 ? Math.round((totalRevenue / totalGoal) * 100) : 0;


    return (
        <Card interactive onClick={handleCardClick}>
        <div className={styles.content}>
            {/* Status Badge with Dot */}
            <div className={styles.statusContainer}>
                <span className={styles.statusDot}></span>
                <span className={styles.statusText}>ACTIVO</span>
            </div>

            {/* Date Info */}
            <div className={styles.dateInfo}>Finaliza el {endDate}</div>

            {/* Event Title */}
            <h2 className={styles.eventTitle}>{title}</h2>

            {/* Dishes List */}
            <div className={styles.dishesContainer}>
                {dishes.map((dish, index) => {
                    const dishSold = dish.sold ?? 0;
                    const dishTotal = dish.total ?? 0;
                    const dishProgress = dishTotal > 0 ? Math.round((dishSold / dishTotal) * 100) : 0;
                    return (
                        <div key={index} className={styles.dishItem}>
                            <div className={styles.dishHeader}>
                                <span className={styles.dishName}>{dish.name}</span>
                                <span className={styles.dishPrice}>${dish.price.toLocaleString()}</span>
                            </div>
                            <div className={styles.dishProgress}>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${dishProgress}%` }}>
                                        <span className={styles.progressText}>{dishProgress}%</span>
                                    </div>
                                </div>
                                <span className={styles.dishStats}>
                                    {dishSold}/{dishTotal} vendidos
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Details Row */}
            <div className={styles.detailsRow}>
                <span className={styles.detailLeft}>
                    Recaudado ${totalRevenue.toLocaleString()}
                </span>
                <span className={styles.detailRight}>
                    Objetivo ${totalGoal.toLocaleString()}
                </span>
            </div>
        </div>
        </Card>
    );
};

export default FoodEventCard;
