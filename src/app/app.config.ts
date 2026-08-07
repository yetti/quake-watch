import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

const QuakePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: QuakePreset,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
      // Complying with community licensing requirements.
      license:
        'eyJpZCI6IjdiZGVjODRkLTA1MzMtNDk2ZC1iYjA3LWE3MjI1Njc2ZGE5NyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODU3MDg4NzksImV4cCI6MTgxNzI0NDg3OX0.LE9WGlNaGAbNAONnCnUMlWq0Aw7ZhK5f3PqDIfhbke-pGQRvmMb63Kwdh2etyuTLvBolbEha-xbVWuT8NngKCQ',
    }),
    {
      provide: LOCALE_ID,
      useValue: 'en-US',
    },
  ],
};
