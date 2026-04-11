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
    try {
      const args = this.event.original_data?.arg;
      if (args && Array.isArray(args) && args.length > 0) {
        return this.formatArgument(args[0]);
      }
      return this.event.function || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  getArguments(): any[] {
    try {
      const args = this.event.original_data?.arg;
      if (args && Array.isArray(args)) {
        return args;
      }
      return [];
    } catch {
      return [];
    }
  }

  formatArgument(arg: any): string {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg, null, 2);
    }
    return String(arg);
  }

  getFailureReason(): string | null {
    try {
      const originalData = this.event.original_data;

      // Check for error message in return data
      if (originalData?.return) {
        const returnData = originalData.return;

        // Check for error in return
        if (typeof returnData === 'object' && returnData !== null) {
          // Look for common error fields
          if (returnData.error) {
            return returnData.error;
          }
          if (returnData.comment) {
            return returnData.comment;
          }
          if (returnData.stderr) {
            return returnData.stderr;
          }

          // Check for failed states in highstate returns
          if (typeof returnData === 'object') {
            for (const key in returnData) {
              const state = returnData[key];
              if (state && typeof state === 'object' && state.result === false) {
                return state.comment || `State ${key} failed`;
              }
            }
          }
        }

        // If return is a string error message
        if (typeof returnData === 'string') {
          return returnData;
        }
      }

      // Check retcode
      if (originalData?.retcode && originalData.retcode !== 0) {
        return `Process exited with code ${originalData.retcode}`;
      }

      return null;
    } catch {
      return null;
    }
  }

  hasReturnData(): boolean {
    return this.event.original_data?.return != null;
  }

  getReturnCode(): string {
    return this.event.original_data?.retcode?.toString() || 'N/A';
  }

  getReturnData(): any {
    return this.event.original_data?.return;
  }

  formatReturnData(): string {
    const returnData = this.getReturnData();
    if (!returnData) return 'No return data';

    if (typeof returnData === 'string') {
      return returnData;
    }

    if (typeof returnData === 'object') {
      return JSON.stringify(returnData, null, 2);
    }

    return String(returnData);
  }

  formatRawData(): string {
    try {
      return JSON.stringify(this.event.original_data, null, 2);
    } catch {
      return 'Unable to format raw data';
    }
  }
}
