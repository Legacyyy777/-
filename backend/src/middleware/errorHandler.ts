import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('❌ Ошибка:', err);

    // Ошибки PostgreSQL
    if ('code' in err) {
        const pgError = err as any;
        
        switch (pgError.code) {
            case '23505': // unique_violation
                return res.status(409).json({
                    success: false,
                    error: 'Запись уже существует',
                });
            case '23503': // foreign_key_violation
                return res.status(400).json({
                    success: false,
                    error: 'Связанная запись не найдена',
                });
            case '23502': // not_null_violation
                return res.status(400).json({
                    success: false,
                    error: 'Обязательное поле не заполнено',
                });
            default:
                console.error('PostgreSQL Error:', pgError.code, pgError.message);
        }
    }

    // Общая ошибка
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Внутренняя ошибка сервера'
            : err.message,
    });
}

