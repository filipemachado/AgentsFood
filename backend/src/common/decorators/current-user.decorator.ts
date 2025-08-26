import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!data) return user;
    
    // Handle nested properties like 'establishment.id'
    const keys = data.split('.');
    let result = user;
    
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) break;
    }
    
    return result;
  },
);