import * as FileSystem from 'expo-file-system/legacy';

const LOG_FILE_PATH = `${FileSystem.documentDirectory}app_debug_logs.txt`;

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogListener = (content: string) => void;

// Gerenciador de inscritos para atualização em tempo real da interface
const listeners: Set<LogListener> = new Set();

export const LoggerService = {
    subscribe(listener: LogListener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    async notifyListeners() {
        const content = await this.getLogs();
        listeners.forEach(listener => listener(content));
    },

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
            // Dispara atualização para a tela de log instantaneamente
            await this.notifyListeners();
        } catch (err) {
            console.error('Falha ao escrever arquivo de log:', err);
        }
    },

    // Atalhos para padronizar os logs em todo o aplicativo
    async logNav(screenName: string): Promise<void> {
        await this.log('INFO', `Navegação: Acessou a tela -> ${screenName}`);
    },

    async logState(serviceName: string, status: string): Promise<void> {
        await this.log('INFO', `Status [${serviceName}]: Alterado para -> ${status}`);
    },

    async logError(context: string, error: any): Promise<void> {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        await this.log('ERROR', `Falha em [${context}]: ${errorMsg}`);
    },

    async getLogs(): Promise<string> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(LOG_FILE_PATH);
            if (fileInfo.exists) {
                return await FileSystem.readAsStringAsync(LOG_FILE_PATH);
            }
            return 'Nenhum log registrado ainda.';
        } catch (err) {
            return `[ERROR] Erro ao ler arquivo de logs: ${err}`;
        }
    },

    async clearLogs(): Promise<void> {
        try {
            await FileSystem.deleteAsync(LOG_FILE_PATH, { idempotent: true });
            await this.log('INFO', 'Arquivo de logs reiniciado pelo usuário.');
        } catch (err) {
            console.error('Erro ao limpar arquivo de logs:', err);
        }
    },
};