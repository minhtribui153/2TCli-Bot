import express from "express";
import routes from "./routes";
import api from './routes/api';

const app = express();

export const start =  (port: any) => {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'pug');
    
    app.use('/', routes);
    app.use('/api', api);
    
    app.listen(port, () => console.log(`SERVER > Server started on port ${port}`));

}