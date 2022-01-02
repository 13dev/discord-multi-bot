export function toTime(e: any) {
    let hours = Math.floor(e / 3600)
        .toString()
        .padStart(2, '0')
    let minutes = Math.floor((e % 3600) / 60)
        .toString()
        .padStart(2, '0')
    let seconds = Math.floor(e % 60)
        .toString()
        .padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}
