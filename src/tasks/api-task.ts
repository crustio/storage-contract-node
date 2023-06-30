import { logger } from '../utils/logger';
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { createRecordOperator } from '../db/operator';
import { API_PORT } from '../consts';

const http = require('http');

export async function createAPI(
  context: AppContext
): Promise<Task> {
  return {
    name: "api",
    start: async (context: AppContext) => {
      const server = http.createServer();

      server.on('request', async(req: any, res: any) => {
        const dbOps = createRecordOperator(context.database)
        let url = new URL(req.url, `http://${req.headers.host}`)
        let resCode = 200
        let resBody = {}
        let resMsg = ''
        const restfulHead = '/api/v0'
        const reqHead = url.pathname.substr(0, restfulHead.length)
        if (reqHead !== restfulHead) {
          resBody = {
            statusCode: 404,
            message: `unknown request:${url.pathname}`
          }
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(resBody));
          return
        }
        const route = url.pathname.substr(restfulHead.length);
        if (req.method === 'GET') {
          // Do GET request
          if ('/order' === route) {
            const status = url.searchParams.get('status') || '';
            const chainType = url.searchParams.get('chainType') || '';
            resBody = await dbOps.getRecordByType(status, chainType);
          } else {
            resMsg = `Unknown request:${url.pathname}`;
            resCode = 404;
          }
        } else if (req.method === 'POST') {
          // Do POST request
          if ('/delete' === route) {
            const txHash = url.searchParams.get('hash') || '';
            await dbOps.deleteByHash(txHash);
          } else if ('/syncToLatestBlock' === route) {
            resBody = await dbOps.syncToLatestBlock();
          } else {
            resMsg = `Unknown request:${url.pathname}`;
            resCode = 404;
          }
        } else {
          // Other type request
        }
        if (resMsg !== '') {
          resBody = {
            statusCode: resCode,
            message: resMsg
          }
        }
        res.writeHead(resCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resBody));
      });
      server.listen(API_PORT);
      logger.info(`Start api on port:${API_PORT} successfully`)
    },
    stop: async () => {
      return true;
    }
  }
}
