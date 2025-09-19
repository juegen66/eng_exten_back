import type { Database } from '../data/database'
import { eq } from 'drizzle-orm'
// import { exten } from '../data/schema' // 暂时注释掉，因为exten表不存在

export class ExtenService {

    private db: Database
    constructor(db: Database) {
        this.db = db
    }

    public async translate(text: string) {
        // TODO: 实现翻译功能，需要先创建exten表
        return { message: '翻译功能待实现', text }
    }

    public async collect(text: string) {
        // TODO: 实现收藏功能，需要先创建exten表
        return { message: '收藏功能待实现', text }
    }

}
