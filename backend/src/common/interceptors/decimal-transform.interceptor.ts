import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DecimalTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('🚀 [DecimalTransform] Interceptor executado para:', context.getHandler().name);
    return next.handle().pipe(
      map(data => {
        console.log('🔄 [DecimalTransform] Dados recebidos do service:', typeof data);
        const transformed = this.transformDecimals(data);
        console.log('✅ [DecimalTransform] Dados transformados:', typeof transformed);
        return transformed;
      })
    );
  }

  private transformDecimals(data: any): any {
    console.log('🔍 [DecimalTransform] Transformando dados:', JSON.stringify(data, null, 2));
    
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        console.log('🔍 [DecimalTransform] Array detectado, processando items...');
        return data.map(item => this.transformDecimals(item));
      }

      const transformed: any = {};
      for (const [key, value] of Object.entries(data)) {
        console.log(`🔍 [DecimalTransform] Processando campo: ${key}, tipo: ${typeof value}, constructor: ${value?.constructor?.name}`);
        
        if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
          console.log(`✅ [DecimalTransform] Decimal detectado em ${key}: ${value} -> ${Number(value)}`);
          transformed[key] = Number(value);
        } else if (typeof value === 'object') {
          transformed[key] = this.transformDecimals(value);
        } else {
          transformed[key] = value;
        }
      }
      return transformed;
    }

    return data;
  }
}
