class State {
    private name_:string | null;
    
    constructor() {
        this.name_ = "Elon Musk";
    }

    // Getters
    get name() {
        return this.name_;
    }

    // Setters
    setName(newName: string) {
        this.name_ = newName;
    }
}

export default State;