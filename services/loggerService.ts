import * as FileSystem from 'expo-file-system/legacy';

const LOG_FILE_PATH = `${FileSystem.documentDirectory}app_debug_logs.txt`;

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogListener = (content: string) => void;
const MAX_LINES = 100;

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

    async log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
        try {
            const timestamp = new Date().toISOString();
            const extraData = data ? ` ${JSON.stringify(data)}` : '';
            const newLogLine = `[${timestamp}] [${level}] ${message}${extraData}`;

            let fileContent = '';
            const fileInfo = await FileSystem.getInfoAsync(LOG_FILE_PATH);

            if (fileInfo.exists) {
                fileContent = await FileSystem.readAsStringAsync(LOG_FILE_PATH);
            }

            let lines = fileContent ? fileContent.split('\n') : [];
            lines.push(newLogLine);

            // Mantém estritamente apenas as últimas 100 linhas para evitar estouro de memória
            if (lines.length > MAX_LINES) {
                lines = lines.slice(-MAX_LINES);
            }

            await FileSystem.writeAsStringAsync(LOG_FILE_PATH, lines.join('\n'));
        } catch (error) {
            console.error('Falha ao escrever arquivo de log:', error);
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
            if (!fileInfo.exists) return 'Nenhum log encontrado.';
            return await FileSystem.readAsStringAsync(LOG_FILE_PATH);
        } catch (error) {
            console.error('Erro ao ler logs:', error);
            return 'Erro ao carregar logs.';
        }
    },

    async clearLogs(): Promise<void> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(LOG_FILE_PATH);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(LOG_FILE_PATH);
            }
        } catch (error) {
            console.error('Erro ao limpar logs:', error);
        }
    },
};