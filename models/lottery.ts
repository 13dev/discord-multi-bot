interface LotteryDatesInterface {
    start: Number
    end: Number
}

interface LotteryRangeInterface {
    min: Number
    max: Number
}

export default class Lottery {
    private _status: Boolean = false
    private _dates: LotteryDatesInterface
    private _range: LotteryRangeInterface

    constructor(status: Boolean, dates: LotteryDatesInterface, range: LotteryRangeInterface) {
        this._status = status;
        this._dates = dates;
        this._range = range;
    }

    public set dates(date: LotteryDatesInterface) {
        this._dates = date
    }

    public set range(range: LotteryRangeInterface) {
        this._range = range
    }

    public get status(): Boolean {
        return this._status
    }

    public get dates(): LotteryDatesInterface {
        return this._dates
    }

    public get range(): LotteryRangeInterface {
        return this._range
    }

    set status(value: Boolean) {
        this._status = value;
    }
}
