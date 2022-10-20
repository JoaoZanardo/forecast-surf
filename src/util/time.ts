import moment from 'moment';

export class TimeUtil {
  static getUnixForAFutureDay(days: number): number {
    return moment().add(days, 'days').unix();
  }
}
