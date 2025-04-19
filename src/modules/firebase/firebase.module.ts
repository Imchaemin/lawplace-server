import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'firebase',
      useFactory: () => {
        if (admin.apps.length) return admin.app();
        return admin.initializeApp({ credential: admin.credential.applicationDefault() });
      },
    },
  ],
  exports: ['firebase'],
})
export class FirebaseModule {}
