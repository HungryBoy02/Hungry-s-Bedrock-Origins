function generateRTLProgressBar(current: number, max: number, totalBars: number, character: string, completedColor: string, incompleteColor: string) {
    return "§r" + completedColor + (character).repeat(Math.ceil(totalBars * (current / max)))
        + incompleteColor + (character).repeat(totalBars - Math.ceil(totalBars * (current / max))) + "§r";
}

export { generateRTLProgressBar }