import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { IS_LOCAL } from '@/constants';

@Injectable()
export class PublicCorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse();

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    return next.handle();
  }
}
export class PrivateCorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const origin = req.headers.origin;

    const lawplacePattern = /.*law-place.kr/;

    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (!origin) {
      res.header('Access-Control-Allow-Origin', '*');
      return next.handle();
    }

    if (IS_LOCAL) {
      res.header('Access-Control-Allow-Origin', origin);
      return next.handle();
    }

    if (lawplacePattern.test(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      return next.handle();
    }

    res.header('Access-Control-Allow-Origin', 'https://law-place.kr');
    return next.handle();
  }
}
