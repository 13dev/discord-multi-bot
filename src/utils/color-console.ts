import color from 'colors'
class ColorConsole {
    public static red(...str: string[]) {
        console.log(color.red(str.join(' ')))
    }

    public static green(...str: string[]) {
        console.log(color.green(str.join(' ')))
    }

    public static yellow(...str: string[]) {
        console.log(color.yellow(str.join(' ')))
    }

    public static gray(...str: string[]) {
        console.log(color.gray(str.join(' ')))
    }
}

export default ColorConsole
