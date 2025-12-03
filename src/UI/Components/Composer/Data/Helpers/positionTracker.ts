const DEFAULT_WIDTH = 264;
const DEFAULT_HEIGHT = 50;
const DEFAULT_VERTICAL_SPACING = 200;

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class PositionTracker {
    private occupied: Map<string, BoundingBox> = new Map();

    constructor(
        private readonly defaultSpacing: number = DEFAULT_VERTICAL_SPACING,
        private readonly defaultWidth: number = DEFAULT_WIDTH,
        private readonly defaultHeight: number = DEFAULT_HEIGHT
    ) { }

    private overlaps(x: number, y: number, width: number, height: number, excludeId?: string): boolean {
        for (const [id, rect] of this.occupied.entries()) {
            if (excludeId && id === excludeId) {
                continue;
            }
            if (
                x < rect.x + rect.width &&
                x + width > rect.x &&
                y < rect.y + rect.height &&
                y + height > rect.y
            ) {
                return true;
            }
        }
        return false;
    }

    findNextYPosition(
        x: number,
        width: number = this.defaultWidth,
        height: number = this.defaultHeight,
        startY: number = 0,
        excludeId?: string
    ): number {
        let y = startY;
        const maxAttempts = 1000;
        let attempts = 0;

        while (this.overlaps(x, y, width, height, excludeId) && attempts < maxAttempts) {
            y += this.defaultSpacing;
            attempts++;
        }

        return y;
    }

    reserve(
        id: string,
        x: number,
        y: number,
        width: number = this.defaultWidth,
        height: number = this.defaultHeight
    ): void {
        this.occupied.set(id, { x, y, width, height });
    }

    getPosition(id: string): BoundingBox | undefined {
        return this.occupied.get(id);
    }

    updatePosition(
        id: string,
        x: number,
        y: number,
        width: number = this.defaultWidth,
        height: number = this.defaultHeight
    ): void {
        this.reserve(id, x, y, width, height);
    }

    clear(): void {
        this.occupied.clear();
    }
}

