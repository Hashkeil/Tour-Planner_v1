export class Tour {
    id: number;
    name: string;
    distance: number;
    duration: number;
    image: string;

    constructor(id: number, name: string, distance: number, duration: number, image: string) {
        this.id = id;
        this.name = name;
        this.distance = distance;
        this.duration = duration;
        this.image = image;
    }

    getTotalDistance(): number {
        return this.distance;
    }

    getTotalDuration(): number {
        return this.duration;
    }

    getTotalTours(): number {
        return this.id;
    }

    getTourImage(): string {
        return this.image;
    }

    getName(): string {
        return this.name;
    }

    isSetImage(): boolean {
        return this.image !== '';
    }
}