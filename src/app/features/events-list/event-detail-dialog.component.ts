import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SaltEvent } from '../../core/models/salt-event.model';

@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './event-detail-dialog.component.html',
  styleUrls: ['./event-detail-dialog.component.scss']
})
export class EventDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public event: SaltEvent) {}

  getEventAction(): string {
    if (this.event.event_action) {
      return this.event.event_action;
    }

    try {
      const args = this.event.original_data?.arg;
      if (args && Array.isArray(args) && args.length > 0) {
        return args[0];
      }

      // Fallback to fun property
      const fun = this.event.original_data?.fun;
      if (fun) {
        return fun;
      }
    } catch {
      // Ignore errors
    }

    // Fallback to function property
    return this.event.function || 'N/A';
  }

  getArguments(): string[] {
    try {
      const args = this.event.original_data?.arg;
      if (args && Array.isArray(args)) {
        return args.filter(arg => typeof arg === 'string');
      }
    } catch {
      // Ignore errors
    }
    return [];
  }

  formatArgument(arg: string): string {
    // Try to pretty-print if it's JSON
    try {
      const parsed = JSON.parse(arg);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return arg;
    }
  }

  getFailureReason(): string | null {
    if (this.event.success !== false) {
      return null;
    }

    try {
      // Try to get comment from return data
      const returnData = this.event.original_data?.return;
      if (returnData && typeof returnData === 'object') {
        if ('comment' in returnData) {
          return returnData.comment as string;
        }
      }

      // Try to get stderr
      const stderr = this.event.original_data?.stderr;
      if (stderr && typeof stderr === 'string' && stderr.trim()) {
        return stderr;
      }

      // Try to get error message
      const error = this.event.original_data?.error;
      if (error && typeof error === 'string') {
        return error;
      }
    } catch {
      // Ignore errors
    }

    return null;
  }

  hasReturnData(): boolean {
    try {
      return !!this.event.original_data?.return;
    } catch {
      return false;
    }
  }

  getReturnCode(): string {
    try {
      const retcode = this.event.original_data?.retcode;
      if (retcode !== undefined && retcode !== null) {
        return retcode.toString();
      }
    } catch {
      // Ignore errors
    }
    return 'N/A';
  }

  getReturnData(): any {
    try {
      return this.event.original_data?.return;
    } catch {
      return null;
    }
  }

  formatReturnData(): string {
    const returnData = this.getReturnData();
    if (!returnData) return 'N/A';

    try {
      if (typeof returnData === 'object') {
        return JSON.stringify(returnData, null, 2);
      }
      return returnData.toString();
    } catch {
      return 'Unable to format return data';
    }
  }

  formatRawData(): string {
    try {
      // Use original_data if available, otherwise use the whole event
      const dataToFormat = this.event.original_data || this.event;
      return JSON.stringify(dataToFormat, null, 2);
    } catch {
      return 'Unable to format raw data';
    }
  }
}
