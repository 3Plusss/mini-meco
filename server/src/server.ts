import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB } from './databaseInitializer';
import { ObjectHandler } from './ObjectHandler';
import { 
    register, login, forgotPassword, resetPassword, confirmEmail, sendConfirmationEmail 
} from './auth';
import { 
    createProjectGroup, createProject, editProjectGroup, editProject, getProjectGroups, getProjects, 
    getSemesters, joinProject, leaveProject, getUserProjects, getUserProjectGroups, getUsersByStatus, 
    updateUserStatus, updateAllConfirmedUsers 
} from './projectManagement';
import { 
    sendStandupsEmail, saveHappinessMetric, createSprints, getProjectHappinessMetrics, getSprints, 
    getProjectCurrentSprint, getProjectURL 
} from './projectFeatures';
import { 
    changeEmail, changePassword, setUserGitHubUsername, getUserGitHubUsername, setUserProjectURL, 
    getUserProjectURL 
} from './userConfig';
import { checkOwnership } from './middleware/authorize';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173' }));

initializeDB().then((db) => {
    const oh = new ObjectHandler();
    console.log("Database initialized, starting server...");



    
    app.get('/', (req, res) => {
        res.send('Server is running!');
    });

    app.get('/user/test', (req, res) => { oh.invokeOnUser("testEcho", req, res, db) });
    app.get('/courseProject/test', (req, res) => { oh.invokeOnCourseProject("testEcho", req, res, db) });
    app.get('/course/test', (req, res) => { oh.invokeOnCourse("testEcho", req, res, db) });
    app.post('/user/protectedTest', checkOwnership(db, oh), (req, res) => { oh.invokeOnUser("testEcho", req, res, db) });

    app.get('/semesters', (req, res) => { getSemesters(req, res, db) });
    app.get('/course', (req, res) => { getProjectGroups(req, res, db) });
    app.get('/courseProject', (req, res) => { getProjects(req, res, db) });
    app.get('/user/projects', (req, res) => { getUserProjects(req, res, db) });
    app.get('/courseProject/happiness', (req, res) => { getProjectHappinessMetrics(req, res, db) });
    app.get('/sprints', (req, res) => { getSprints(req, res, db) });
    app.get('/currentSprint', (req, res) => { getProjectCurrentSprint(req, res, db) });
    app.get('/getGitURL', (req, res) => { getUserProjectURL(req, res, db) }); // to be removed, duplicate of /user/user/project/url
    app.get('/user/githubUsername', (req, res) => { getUserGitHubUsername(req, res, db) });
    app.get('/course/user', (req, res) => { getUserProjectGroups(req, res, db) });
    app.get('/user/projects', (req, res) => { getProjectURL(req, res, db) });
    app.get('/user/status', (req, res) => { getUsersByStatus(req, res, db) });

    app.post('/user', (req, res) => register(req, res, db));
    app.post('/courseProject/:courseProjectId/user/:userId', async (req, res) => { joinProject(req, res, db); });
    app.delete('/courseProject/:courseProjectId/user/:userId', async (req, res) => { leaveProject(req, res, db); });

    app.post('/user/:userMail/email', async (req, res) => { changeEmail(req, res, db); });
    app.post('/user/:userMail/password', async (req, res) => { changePassword(req, res, db); });
    app.post('/session', (req, res) => login(req, res, db));
    app.post('/user/password/forgotMail', (req, res) => { forgotPassword(req, res, db); });
    app.post('/user/password', (req, res) => { resetPassword(req, res, db); });
    app.post('/course', (req, res) => { createProjectGroup(req, res, db); });
    app.post('/courseProject', (req, res) => { createProject(req, res, db); });
    app.put('/course', (req, res) => { editProjectGroup(req, res, db); });
    app.put('/courseProject', (req, res) => { editProject(req, res, db); });
    app.post('/user/githubUsername', (req, res) => { setUserGitHubUsername(req, res, db); });
    app.post('/project/standupsEmail', (req, res) => { sendStandupsEmail(req, res, db); });
    app.post('/courseProject/happiness', (req, res) => { saveHappinessMetric(req, res, db); });
    app.post('/courseProject/sprints', (req, res) => { createSprints(req, res, db); });
    app.post('/user/project/url', (req, res) => { setUserProjectURL(req, res, db); });
    app.post('/user/confirmation/email', (req, res) => { confirmEmail(req, res, db); });
    app.post('/user/status',checkOwnership(db, oh), (req, res) => { updateUserStatus(req, res, db); });
    app.post('/user/confirmation/trigger', (req, res) => { sendConfirmationEmail(req, res, db); });
    //app.post('/user/status', (req, res) => { updateAllConfirmedUsers(req, res, db); });

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to initialize the database:', error);
});
