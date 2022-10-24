export interface Standing{
    uuid?: string,
    round_number: number,
    place?: number,
    category_place?: number,
    points: number,
    tiebreaks?: Array<any>,
}
