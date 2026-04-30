import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    const apiUrl =
        'https://project-and-team-management-app-production.up.railway.app/api';

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService],
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    describe('initializeAuth', () => {
        it('should return null observable if no token exists', async () => {
            const res = await firstValueFrom(service.initializeAuth());
            expect(res).toBeNull();
        });

        it('should fetch current user and update subject if token exists', async () => {
            const mockUser = { id: 1, name: 'John Doe' };
            localStorage.setItem('auth_token', 'valid-token');

            const authInitPromise = firstValueFrom(service.initializeAuth());

            const req = httpMock.expectOne(`${apiUrl}/me`);
            expect(req.request.method).toBe('GET');
            req.flush(mockUser);

            const res = await authInitPromise;
            expect(res).toEqual(mockUser);

            const user = await firstValueFrom(service.currentUser$);
            expect(user).toEqual(mockUser);
        });

        it('should remove invalid token and reset user on error', async () => {
            localStorage.setItem('auth_token', 'bad-token');

            const authInitPromise = firstValueFrom(service.initializeAuth());

            const req = httpMock.expectOne(`${apiUrl}/me`);
            req.flush('Unauthorized', {
                status: 401,
                statusText: 'Unauthorized',
            });

            const res = await authInitPromise;
            expect(res).toBeNull();
            expect(localStorage.getItem('auth_token')).toBeNull();

            const user = await firstValueFrom(service.currentUser$);
            expect(user).toBeNull();
        });
    });

    describe('login', () => {
        it('should store token and update current user on successful login', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockResponse = {
                access_token: 'jwt-token',
                user: { id: 1, name: 'Test User' },
            };

            const loginPromise = firstValueFrom(service.login(credentials));

            const req = httpMock.expectOne(`${apiUrl}/login`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(credentials);
            req.flush(mockResponse);

            const res = await loginPromise;
            expect(res).toEqual(mockResponse);
            expect(localStorage.getItem('auth_token')).toBe('jwt-token');

            const user = await firstValueFrom(service.currentUser$);
            expect(user).toEqual(mockResponse.user);
        });

        it('should not store token if access_token is missing', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockResponse = {
                user: { id: 1, name: 'Test User' },
            };

            const loginPromise = firstValueFrom(service.login(credentials));

            const req = httpMock.expectOne(`${apiUrl}/login`);
            req.flush(mockResponse);

            const res = await loginPromise;
            expect(res).toEqual(mockResponse);
            expect(localStorage.getItem('auth_token')).toBeNull();
        });
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const userData = {
                name: 'John',
                email: 'john@example.com',
                password: 'password123',
            };

            const mockResponse = { message: 'Registered successfully' };

            const registerPromise = firstValueFrom(service.register(userData));

            const req = httpMock.expectOne(`${apiUrl}/register`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(userData);
            req.flush(mockResponse);

            const res = await registerPromise;
            expect(res).toEqual(mockResponse);
        });
    });

    describe('logout', () => {
        beforeEach(() => {
            localStorage.setItem('auth_token', 'token');
            localStorage.setItem('token', 'legacy-token');
            localStorage.setItem('user', 'legacy-user');
            localStorage.setItem('userEmail', 'legacy@email.com');
            localStorage.setItem('userName', 'legacy-name');
        });

        it('should clear all tokens and reset current user on successful logout', async () => {
            const logoutPromise = firstValueFrom(service.logout());

            const req = httpMock.expectOne(`${apiUrl}/logout`);
            expect(req.request.method).toBe('POST');
            req.flush({});

            const res = await logoutPromise;
            expect(res).toEqual({});
            expect(localStorage.getItem('auth_token')).toBeNull();
            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('user')).toBeNull();
            expect(localStorage.getItem('userEmail')).toBeNull();
            expect(localStorage.getItem('userName')).toBeNull();

            const user = await firstValueFrom(service.currentUser$);
            expect(user).toBeNull();
        });

        it('should still clear tokens even if logout API fails', async () => {
            const logoutPromise = firstValueFrom(service.logout());

            const req = httpMock.expectOne(`${apiUrl}/logout`);
            req.flush('Server error', {
                status: 500,
                statusText: 'Server Error',
            });

            const res = await logoutPromise;
            expect(res).toBeNull();
            expect(localStorage.getItem('auth_token')).toBeNull();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('getUsers', () => {
        it('should fetch users list', async () => {
            const mockUsers = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2' },
            ];

            const getUsersPromise = firstValueFrom(service.getUsers());

            const req = httpMock.expectOne(`${apiUrl}/users`);
            expect(req.request.method).toBe('GET');
            req.flush(mockUsers);

            const users = await getUsersPromise;
            expect(users).toEqual(mockUsers);
        });
    });

    describe('updateUserRole', () => {
        it('should update user role', async () => {
            const mockResponse = { message: 'Role updated' };

            const updateRolePromise = firstValueFrom(service.updateUserRole(1, 'admin'));

            const req = httpMock.expectOne(`${apiUrl}/users/1/role`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({ role: 'admin' });
            req.flush(mockResponse);

            const res = await updateRolePromise;
            expect(res).toEqual(mockResponse);
        });
    });

    describe('updateProfile', () => {
        it('should update profile and current user subject', async () => {
            const userData = { name: 'Updated Name' };

            const mockResponse = {
                user: { id: 1, name: 'Updated Name' },
            };

            const updateProfilePromise = firstValueFrom(service.updateProfile(userData));

            const req = httpMock.expectOne(`${apiUrl}/profile`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(userData);
            req.flush(mockResponse);

            const res = await updateProfilePromise;
            expect(res).toEqual(mockResponse);

            const user = await firstValueFrom(service.currentUser$);
            expect(user).toEqual(mockResponse.user);
        });

        it('should not update current user if response has no user', async () => {
            const userData = { name: 'Updated Name' };
            const mockResponse = { success: true };

            const updateProfilePromise = firstValueFrom(service.updateProfile(userData));

            const req = httpMock.expectOne(`${apiUrl}/profile`);
            req.flush(mockResponse);

            const res = await updateProfilePromise;
            expect(res).toEqual(mockResponse);
        });
    });
});