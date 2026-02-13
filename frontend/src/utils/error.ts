
export class LiveQuizError extends Error {
    message: string;
    
    constructor(message: string) {
        super();
        this.name= "LiveQuiz error"
        this.message = message;
    }

}