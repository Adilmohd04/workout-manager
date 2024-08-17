import { TestBed } from '@angular/core/testing';
import { WorkoutService, User } from './workout.service';
import { LocalStorageService } from './storage.service';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

describe('WorkoutService', () => {
  let service: WorkoutService;
  let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;
  let initialUsers: User[];

  beforeEach(() => {
    localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['getItem', 'setItem']);
    initialUsers = [
      { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }, { type: 'Cycling', minutes: 45 }] },
      { id: 2, name: 'Jane Smith', workouts: [{ type: 'Swimming', minutes: 60 }, { type: 'Running', minutes: 20 }] },
      { id: 3, name: 'Mike Johnson', workouts: [{ type: 'Yoga', minutes: 50 }, { type: 'Cycling', minutes: 40 }] }
    ];

    localStorageServiceSpy.getItem.and.returnValue(initialUsers);
    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
        { provide: LocalStorageService, useValue: localStorageServiceSpy }
      ]
    });
    service = TestBed.inject(WorkoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with predefined users', (done) => {
    service.getUsers().pipe(take(1)).subscribe(users => {
      expect(users.length).toBe(3);
      expect(users).toEqual(initialUsers);
      done();
    });
  });

  it('should add a workout for an existing user', (done) => {
    const userName = 'John Doe';
    const workoutType = 'Running';
    const minutes = 20;

    service.addUserWorkout(userName, workoutType, minutes);
    service.getUsers().pipe(take(1)).subscribe(users => {
      const user = users.find(u => u.name === userName);
      const workout = user?.workouts.find(w => w.type === workoutType);
      expect(workout).toBeTruthy();
      expect(workout?.minutes).toBe(50); // 30 + 20
      done();
    });
  });

  it('should add a new workout type for an existing user', (done) => {
    const userName = 'Jane Smith';
    const workoutType = 'Cycling';
    const minutes = 30;

    service.addUserWorkout(userName, workoutType, minutes);
    service.getUsers().pipe(take(1)).subscribe(users => {
      const user = users.find(u => u.name === userName);
      const workout = user?.workouts.find(w => w.type === workoutType);
      expect(workout).toBeTruthy();
      expect(workout?.minutes).toBe(30);
      done();
    });
  });

  it('should add a workout for a new user', (done) => {
    const userName = 'New User';
    const workoutType = 'Running';
    const minutes = 45;

    service.addUserWorkout(userName, workoutType, minutes);
    service.getUsers().pipe(take(1)).subscribe(users => {
      const user = users.find(u => u.name === userName);
      expect(user).toBeTruthy();
      expect(user?.workouts.length).toBe(1);
      expect(user?.workouts[0].type).toBe(workoutType);
      expect(user?.workouts[0].minutes).toBe(minutes);
      done();
    });
  });

  it('should delete a user', (done) => {
    const userId = 1;

    service.deleteUser(userId);
    service.getUsers().pipe(take(1)).subscribe(users => {
      const user = users.find(u => u.id === userId);
      expect(user).toBeUndefined();
      done();
    });
  });

  it('should initialize with default data if local storage is empty', (done) => {
    localStorageServiceSpy.getItem.and.returnValue([]);
    service = TestBed.inject(WorkoutService); // Re-create service instance with updated spy

    service.getUsers().pipe(take(1)).subscribe(users => {
      expect(users.length).toBe(3);
      expect(users).toEqual(initialUsers);
      done();
    });
  });



});
