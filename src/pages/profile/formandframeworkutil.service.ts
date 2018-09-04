import {
    Injectable,
    NgZone
} from '@angular/core';
import { Events } from 'ionic-angular';
import {
    FrameworkService,
    CategoryRequest,
    FrameworkDetailsRequest,
    SharedPreferences,
    FormRequest,
    FormService
} from 'sunbird';
import { AppGlobalService } from '../../service/app-global.service';
import { AppVersion } from "@ionic-native/app-version";
import { FrameworkConstant, FormConstant, PreferenceKey } from '../../app/app.constant';

@Injectable()
export class FormAndFrameworkUtilService {

    /**
     * This variable is used to store the language selected, which is required when getting form related details.
     * 
     */
    selectedLanguage: string;

    constructor(
        private framework: FrameworkService,
        public events: Events,
        public zone: NgZone,
        public preference: SharedPreferences,
        private formService: FormService,
        private appGlobalService: AppGlobalService,
        private appVersion: AppVersion
    ) {
        //Get language selected
        this.preference.getString(PreferenceKey.SELECTED_LANGUAGE_CODE)
            .then(val => {
                if (val && val.length) {
                    this.selectedLanguage = val;
                }
            });
    }

    /**
     * This method gets the form related details.
     * 
     */
    getSyllabusList(): Promise<any> {
        return new Promise((resolve, reject) => {
            let syllabusList: Array<any> = [];

            //get cached form details
            syllabusList = this.appGlobalService.getCachedSyllabusList()

            if ((syllabusList === undefined || syllabusList.length == 0)
                || (syllabusList !== undefined && syllabusList.length == 1)) {
                syllabusList = [];
                this.callSyllabusListApi(syllabusList, resolve, reject);
            } else {

                resolve(syllabusList);
            }

        })
    }


    /**
     * This method gets the Library filter config.
     * 
     */
    getLibraryFilterConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            let libraryFilterConfig: Array<any> = [];

            //get cached library config
            libraryFilterConfig = this.appGlobalService.getCachedLibraryFilterConfig()

            if (libraryFilterConfig === undefined || libraryFilterConfig.length == 0) {
                libraryFilterConfig = [];
                this.invokeLibraryFilterConfigFormApi(libraryFilterConfig, resolve, reject);
            } else {
                resolve(libraryFilterConfig);
            }

        })
    }

    /**
     * This method gets the course filter config.
     * 
     */
    getCourseFilterConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            let courseFilterConfig: Array<any> = [];

            //get cached course config
            courseFilterConfig = this.appGlobalService.getCachedCourseFilterConfig()

            if (courseFilterConfig === undefined || courseFilterConfig.length == 0) {
                courseFilterConfig = [];
                this.invokeCourseFilterConfigFormApi(courseFilterConfig, resolve, reject);
            } else {
                resolve(courseFilterConfig);
            }
        });
    }

    /**
     * Network call to form api
     * 
     * @param syllabusList 
     * @param resolve 
     * @param reject 
     */
    private callSyllabusListApi(syllabusList: any[], resolve: (value?: any) => void, reject: (reason?: any) => void) {
        // form api request
        let req: FormRequest = {
            type: 'user',
            subType: 'instructor',
            action: 'onboarding',
            defaultFormPath: FormConstant.DEFAULT_SYALLABUS_PATH
        };
        //form api call
        this.formService.getForm(req, (res: any) => {
            let response: any = JSON.parse(res);
            console.log("Form Result - " + response.result);
            let frameworks: Array<any> = [];
            let fields: Array<any> = response.result.fields;
            fields.forEach(field => {
                if (field.language === this.selectedLanguage) {
                    frameworks = field.range;
                }
            });

            //this condition will be executed when selected language is not present in the frameworks
            //then it will be defaulted to English
            if (frameworks.length === 0) {
                fields.forEach(field => {
                    if (field.language === 'en') {
                        frameworks = field.range;
                    }
                });
            }

            if (frameworks != null && frameworks.length > 0) {
                frameworks.forEach(frameworkDetails => {
                    let value = { 'name': frameworkDetails.name, 'frameworkId': frameworkDetails.frameworkId };
                    syllabusList.push(value);
                });

                //store the framework list in the app component, so that when getFormDetails() gets called again
                //in the same session of app, then we can get this details, without calling the api
                this.appGlobalService.setSyllabusList(syllabusList);
            }
            resolve(syllabusList);
        }, (error: any) => {
            console.log("Error - " + error);
            // Adding default framework into the list
            let defaultFramework = {
                name: FrameworkConstant.DEFAULT_FRAMEWORK_NAME,
                frameworkId: FrameworkConstant.DEFAULT_FRAMEWORK_ID
            }

            syllabusList.push(defaultFramework);
            resolve(syllabusList);
        });
    }


    /**
     * Network call to form api
     * 
     * @param courseFilterConfig 
     * @param resolve 
     * @param reject 
     */
    private invokeCourseFilterConfigFormApi(courseFilterConfig: Array<any>, resolve: (value?: any) => void, reject: (reason?: any) => void) {
        let req: FormRequest = {
            type: 'pageAssemble',
            subType: 'course',
            action: 'filter',
            defaultFormPath: FormConstant.DEFAULT_PAGE_COURSE_FILTER_PATH
        };
        //form api call
        this.formService.getForm(req, (res: any) => {
            let response: any = JSON.parse(res);
            courseFilterConfig = response.result.fields;
            this.appGlobalService.setCourseFilterConfig(courseFilterConfig);
            resolve(courseFilterConfig);
        }, (error: any) => {
            console.log("Error - " + error);
            resolve(courseFilterConfig);
        });
    }


    /**
     * Network call to form api
     * 
     * @param libraryFilterConfig 
     * @param resolve 
     * @param reject 
     */
    private invokeLibraryFilterConfigFormApi(libraryFilterConfig: Array<any>, resolve: (value?: any) => void, reject: (reason?: any) => void) {
        let req: FormRequest = {
            type: 'pageAssemble',
            subType: 'library',
            action: 'filter',
            defaultFormPath: FormConstant.DEFAULT_PAGE_LIBRARY_FILTER_PATH
        };
        //form api call
        this.formService.getForm(req, (res: any) => {
            let response: any = JSON.parse(res);
            libraryFilterConfig = response.result.fields;
            this.appGlobalService.setLibraryFilterConfig(libraryFilterConfig);
            resolve(libraryFilterConfig);
        }, (error: any) => {
            console.log("Error - " + error);
            resolve(libraryFilterConfig);
        });
    }


    /**
     * Get all categories using framework api
     */
    getFrameworkDetails(frameworkId: string): Promise<any> {

        return new Promise((resolve, reject) => {
            let req: FrameworkDetailsRequest = {
                defaultFrameworkDetails: true
            };

            if (frameworkId !== undefined && frameworkId.length) {
                req.defaultFrameworkDetails = false;
                req.frameworkId = frameworkId;
            }

            this.framework.getFrameworkDetails(req)
                .then(res => {
                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }


    /**
     * 
     * This gets the categoy data according to current and previously selected values
     * 
     * @param req 
     * @param frameworkId 
     */
    getCategoryData(req: CategoryRequest, frameworkId?: string): Promise<any> {

        return new Promise((resolve, reject) => {
            if (frameworkId !== undefined && frameworkId.length) {
                req.frameworkId = frameworkId;
            }

            let categoryList: Array<any> = [];

            this.framework.getCategoryData(req)
                .then(res => {
                    const category = JSON.parse(res);
                    const resposneArray = category.terms;
                    let value = {};
                    resposneArray.forEach(element => {

                        value = { 'name': element.name, 'code': element.code };

                        categoryList.push(value);
                    });

                    resolve(categoryList);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * This method checks if the newer version of the available and respectively shows the dialog with relevant contents
     */
    checkNewAppVersion(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log("checkNewAppVersion Called");

            this.appVersion.getVersionCode()
                .then((versionCode: any) => {
                    console.log("checkNewAppVersion Current app version - " + versionCode);

                    let result: any;

                    // form api request
                    let req: FormRequest = {
                        type: 'app',
                        subType: 'install',
                        action: 'upgrade'
                    };
                    //form api call
                    this.formService.getForm(req, (res: any) => {
                        let response: any = JSON.parse(res);

                        let fields: Array<any> = [];
                        let ranges: Array<any> = [];
                        let upgradeTypes: Array<any> = [];

                        if (response && response.result && response.result.fields) {
                            fields = response.result.fields;

                            fields.forEach(element => {
                                if (element.language === this.selectedLanguage) {
                                    if (element.range) {
                                        ranges = element.range;
                                    }

                                    if (element.upgradeTypes) {
                                        upgradeTypes = element.upgradeTypes;
                                    }
                                }
                            });

                            if (ranges && ranges.length > 0 && upgradeTypes && upgradeTypes.length > 0) {
                                let type: string;
                                const forceType = "force"

                                ranges.forEach(element => {
                                    if (versionCode === element.minVersionCode ||
                                        (versionCode > element.minVersionCode && versionCode < element.maxVersionCode) ||
                                        versionCode === element.maxVersionCode) {
                                        console.log("App needs a upgrade of type - " + element.type)
                                        type = element.type;

                                        if (type === forceType) {
                                            return true; // this is to stop the foreach loop
                                        }
                                    }
                                });

                                upgradeTypes.forEach(upgradeElement => {
                                    if (type === upgradeElement.type) {
                                        result = upgradeElement
                                    }
                                });
                            }
                        }

                        resolve(result);
                    }, (error: any) => {
                        reject(error);
                    });
                });
        });
    }
}