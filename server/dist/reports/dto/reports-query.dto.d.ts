export declare enum ReportsPeriod {
    SEVEN_DAYS = "7d",
    THIRTY_DAYS = "30d",
    NINETY_DAYS = "90d",
    ONE_YEAR = "1y",
    ALL = "all"
}
export declare class ReportsQueryDto {
    period?: ReportsPeriod;
}
