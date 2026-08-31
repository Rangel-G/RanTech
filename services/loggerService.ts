import * as FileSystem from 'expo-file-system/legacy';

const LOG_FILE_PATH = `${FileSystem.documentDirectory}app_debug_logs.txt`;

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export const LoggerService = {
    /**
     * Grava uma mensagem formatada com timestamp no arquivo de log local
     */
    async log(level: LogLevel, message: string, extraData?: any): Promise<void> {
        const timestamp = new Date().toISOString();
        const dataString = extraData
            ? ` | Data: ${typeof extraData === 'object' ? JSON.stringify(extraData) : extraData}`
            : '';
        const logEntry = `[${timestamp}] [${level}] ${message}${dataString}\n`;

        console.log(logEntry.trim());

        try {
            const fileInfo = await FileSystem.getInfoAsync(LOG_FILE_PATH);
            if (fileInfo.exists) {
                const existingContent = await FileSystem.readAsStringAsync(LOG_FILE_PATH);
                await FileSystem.writeAsStringAsync(LOG_FILE_PATH, existingContent + logEntry);
            } else {
                await FileSystem.writeAsStringAsync(LOG_FILE_PATH, logEntry);
            }
        } catch (err) {
            console.error('Falha ao escrever arquivo de log:', err);
        }
    },

    /**
     * Retorna todo o conteúdo gravado no arquivo de log
     */
    async getLogs(): Promise<string> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(LOG_FILE_PATH);
            if (fileInfo.exists) {
                return await FileSystem.readAsStringAsync(LOG_FILE_PATH);
            }
            return 'Nenhum log registrado ainda.';
        } catch (err) {
            return `Erro ao ler arquivo de logs: ${err}`;
        }
    },

    /**
     * Apaga o arquivo de log do armazenamento
     */
    async clearLogs(): Promise<void> {
        try {
            await FileSystem.deleteAsync(LOG_FILE_PATH, { idempotent: true });
            await this.log('INFO', 'Arquivo de logs reiniciado.');
        } catch (err) {
            console.error('Erro ao limpar arquivo de logs:', err);
        }
    },
};