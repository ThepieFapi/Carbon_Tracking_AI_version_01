import { Service } from 'typedi';
import { Training } from 'common/interfaces/training';
import { DataBaseService } from '../database/database-service';

@Service()
export class TrainingManager {
    private liveTraining!: Training | undefined;

    // TODO: Once the project allows for multiple live trainings, remove this and get live training by ID in trainings.
    // Indeed, in that case, the worker request will contain their training Id.
    private trainings!: Map<string, Training>;

    constructor(private readonly dataBaseService: DataBaseService) {
        this.trainings = new Map<string, Training>();
        this.setAllTrainings();
        this.liveTraining = undefined; // TODO: Remove when we accept many live trainings
    }

    addLiveTraining(training: Training) {
        this.trainings.set(training.id, training);
        this.liveTraining = training; // TODO: Remove when we accept many live trainings
    }

    // TODO: Remove when we accept many live trainings, simply updating the trainings will be fine
    removeLiveTraining() {
        this.liveTraining = undefined;
    }

    // TODO: Remove when we accept many live trainings, use getTrainingById()
    getLiveTraining(): Training | undefined {
        return this.liveTraining;
    }

    updateTraining(training: Training) {
        this.trainings.set(training.id, training);
    }

    getAllTrainings(): Training[] {
        return [...this.trainings.values()];
    }

    getTrainingById(id: string): Training | undefined {
        return this.trainings.get(id);
    }

    private async setAllTrainings() {
        // This is done when the service gets created (the server gets launched).
        const trainings: Training[] = await this.dataBaseService.getAllTrainings();

        trainings?.forEach((training: Training) => {
            this.trainings.set(training.id, training);
        });
    }
}
