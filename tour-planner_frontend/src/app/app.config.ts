import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import {
  LayoutDashboard, Map, Settings, ArrowUpDown, LogOut, ChevronLeft, ChevronRight, X, Menu,
  ClipboardList, Ruler, Timer, MapPin, CalendarDays, Zap, Bike, Mountain, Footprints, Plane,
  Search, Pencil, Trash2, ChartBar, Camera, TriangleAlert, CircleX, FileText, Image,
  Info, Check, User, Palette, Bell, Globe, Sun, Moon, RefreshCw, CircleCheck,
  Table2, FolderOpen, Upload, Route
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        LayoutDashboard, Map, Settings, ArrowUpDown, LogOut, ChevronLeft, ChevronRight, X, Menu,
        ClipboardList, Ruler, Timer, MapPin, CalendarDays, Zap, Bike, Mountain, Footprints, Plane,
        Search, Pencil, Trash2, ChartBar, Camera, TriangleAlert, CircleX, FileText, Image,
        Info, Check, User, Palette, Bell, Globe, Sun, Moon, RefreshCw, CircleCheck,
        Table2, FolderOpen, Upload, Route
      }),
      multi: true
    }
  ]
};
