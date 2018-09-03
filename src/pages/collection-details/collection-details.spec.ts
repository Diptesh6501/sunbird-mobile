import {
    Events, IonicModule, LoadingController, NavController, NavParams, Platform, PopoverController,
    ToastController
} from 'ionic-angular';
import { NetworkMock, StorageMock } from 'ionic-mocks';
import { Ionic2RatingModule } from 'ionic2-rating';
import { Observable } from 'rxjs/Observable';
import {
    AuthService, BuildParamService, ContentService, CourseService, FileUtil, FrameworkModule,
    GenieSDKServiceProvider, ProfileType, SharedPreferences, ShareUtil, TelemetryService
} from 'sunbird';

import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import {
    AuthServiceMock, FileUtilMock, GenieSDKServiceProviderMock, LoadingControllerMock, NavMock,
    NavParamsMock, PlatformMock, PopoverControllerMock, SharedPreferencesMock, SocialSharingMock,
    ToastControllerMock, TranslateLoaderMock
} from '../../../test-config/mocks-ionic';
import { PBHorizontal } from '../../component/pbhorizontal/pb-horizontal';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { AppGlobalService } from '../../service/app-global.service';
import { TelemetryGeneratorService } from '../../service/telemetry-generator.service';
import { CollectionDetailsPage } from './collection-details';
import { mockRes } from './collection-details.spec.data';

declare let GenieSDK: any;

describe('CollectionDetailsPage Component', () => {
    let component: CollectionDetailsPage;
    let fixture: ComponentFixture<CollectionDetailsPage>;
    let translateService: TranslateService;
    let identifier = 'do_212516141114736640146589';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CollectionDetailsPage, PBHorizontal],
            imports: [
                IonicModule.forRoot(CollectionDetailsPage),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateLoaderMock },
                }),
                PipesModule,
                HttpClientModule,
                FrameworkModule,
                DirectivesModule,
                Ionic2RatingModule
            ],
            providers: [
                ContentService, TelemetryService, CourseService, ShareUtil, TelemetryGeneratorService,
                // { provide: Platform, useClass: PlatformMock },
                { provide: FileUtil, useClass: FileUtilMock },
                { provide: NavController, useClass: NavMock },
                { provide: Events, useClass: Events },
                { provide: NavParams, useClass: NavParamsMock },
                { provide: SocialSharing, useClass: SocialSharingMock },
                { provide: Network, useFactory: () => NetworkMock.instance('none') },
                { provide: AppGlobalService, useClass: AppGlobalService },
                { provide: AuthService, useClass: AuthServiceMock },
                { provide: GenieSDKServiceProvider, useClass: GenieSDKServiceProviderMock },
                // { provide: SharedPreferences, useClass: SharedPreferencesMock },
                { provide: ToastController, useClass: ToastControllerMock },
                { provide: PopoverController, useFactory: () => PopoverControllerMock.instance() },
                { provide: LoadingController, useFactory: () => LoadingControllerMock.instance() },
                SharedPreferences
            ]
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CollectionDetailsPage);
        component = fixture.componentInstance;
    });

    beforeEach(() => {
        inject([TranslateService], (service) => {
            translateService = service;
            translateService.use('en');
        })
    });

    it('should create a valid instance of CollectionDetailsPage', () => {
        expect(component instanceof CollectionDetailsPage).toBe(true);
        expect(component).not.toBeFalsy();
    });

    it('should return Loading object', () => {
        const loadingCtrlStub = TestBed.get(LoadingController);
        expect(component.getLoader).toBeDefined();
        spyOn(component, 'getLoader').and.callThrough();
        component.getLoader();
        expect(component.getLoader).toHaveBeenCalled();
        expect(loadingCtrlStub.create).toHaveBeenCalled();
    });

    it('should set content details', () => {
        component.contentDetail = {};
        component.userRating = 0;
        const contentService = TestBed.get(ContentService);
        const loadingCtrl = TestBed.get(LoadingController);
        spyOn(component, 'setContentDetails').and.callThrough();
        //        spyOn(component, 'extractApiResponse').and.callThrough();
        spyOn(contentService, 'getContentDetail').and.callFake(function (option, success, error) {
            let data = JSON.stringify((mockRes.contentDetailsResponse))
            return success(data);
        });
        //spyOn(loadingCtrl, 'dismiss').and.returnValues(Promise.resolve());
        component.setContentDetails(identifier, true);
        expect(component.setContentDetails).toBeDefined();
        expect(component.setContentDetails).toHaveBeenCalledWith(identifier, true);
        //        expect(component.extractApiResponse).toBeDefined();
        //        expect(component.extractApiResponse).toHaveBeenCalled();
    });

    it('should extract content details api response: when content locally available', () => {
        component.contentDetail = {};
        component.cardData = {};
        component.cardData.contentData = '';
        component.cardData.pkgVersion = '';
        spyOn(component, 'extractApiResponse').and.callThrough();
        component.extractApiResponse(mockRes.contentDetailsResponse);
        fixture.detectChanges();
        expect(component.contentDetail).not.toBeUndefined();
    });

    it('should extract content details api response: content Locally not available', () => {
        component.contentDetail = {};
        let data = mockRes.contentDetailsResponse;
        data.result.contentData.gradeLevel = ['Class 1', 'Class 2'];
        data.result.isAvailableLocally = false;
        spyOn(component, 'extractApiResponse').and.callFake;
        component.extractApiResponse(data);
        fixture.detectChanges();
        expect(component.extractApiResponse).toBeDefined();
        expect(component.extractApiResponse).toHaveBeenCalled();
        expect(component.contentDetail).not.toBeUndefined();
        // expect(component.contentDetail.downloadable).toBe(false);
    });

    it('should open content rating screen', () => {
        const popOverCtrl = TestBed.get(PopoverController);
        //spyOn(popOverCtrl, 'create').and.callThrough();
        component.contentDetail = {};
        component.contentDetail.isAvailableLocally = true;
        component.guestUser = false;
        spyOn(component, 'rateContent').and.callThrough();
        component.rateContent();
        fixture.detectChanges();
        expect(component.rateContent).toHaveBeenCalled();
        expect(popOverCtrl.create).toHaveBeenCalled();
    });

    it('should display toast message', () => {
        console.log("component", component);
        component.isDownloadStarted = true;
        spyOn(component, 'showMessage');
        component.showMessage('Test', false);
        fixture.detectChanges();
        //expect(component.showMessage).toHaveBeenCalled();
        //expect(component.toastCtrl.create).toHaveBeenCalled();
    });

    it('should show no inetrnet message when user click on download button', () => {
        const toastCtrl = TestBed.get(ToastController);
        component.isNetworkAvailable = false;
        spyOn(component, 'translateAndDisplayMessage').and.callThrough();
        spyOn(component, 'showMessage').and.callThrough();
        component.translateAndDisplayMessage('ERROR_NO_INTERNET_MESSAGE');
        fixture.detectChanges();
        expect(component.showMessage).toHaveBeenCalled();
        expect(component.translateAndDisplayMessage).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
    });

    it('should check profile type. ProfileType should be TEACHER', (done) => {
        const sharedPreferences = TestBed.get(SharedPreferences);
        spyOn(component, 'checkCurrentUserType').and.callThrough();
        spyOn(sharedPreferences, 'getString').and.returnValue(Promise.resolve(ProfileType.TEACHER));
        component.checkCurrentUserType();
        sharedPreferences.getString().then((val) => {
            expect(component.checkCurrentUserType).toBeDefined();
            expect(component.checkCurrentUserType).toHaveBeenCalled();
            expect(sharedPreferences.getString).toHaveBeenCalled();
            expect(component.profileType).toEqual(ProfileType.TEACHER);
            expect(component.profileType).not.toBe(ProfileType.STUDENT);
            expect(val).toEqual(ProfileType.TEACHER);
            done();
        });

    });

    it('should check profile type. ProfileType should be STUDENT', (done) => {
        const sharedPreferences = TestBed.get(SharedPreferences);
        spyOn(component, 'checkCurrentUserType').and.callThrough();
        spyOn(sharedPreferences, 'getString').and.returnValue(Promise.resolve(ProfileType.STUDENT));
        component.checkCurrentUserType();
        sharedPreferences.getString().then((val) => {
            expect(component.checkCurrentUserType).toBeDefined();
            expect(component.checkCurrentUserType).toHaveBeenCalled();
            expect(sharedPreferences.getString).toHaveBeenCalled();
            expect(component.profileType).toEqual(ProfileType.STUDENT);
            expect(component.profileType).not.toBe(ProfileType.TEACHER);
            expect(val).toEqual(ProfileType.STUDENT);
            done();
        });
    });

    it('should genearte rollup object', () => {
        component.cardData = {
            hierarchyInfo: undefined
        };
        component.cardData.hierarchyInfo = mockRes.hierarchyInfo;
        spyOn(component, 'generateRollUp').and.callThrough();
        component.generateRollUp();
        expect(component.cardData.hierarchyInfo).not.toBeNull();
        expect(component.generateRollUp).toBeDefined();
        expect(component.generateRollUp).toHaveBeenCalled();
        expect(component.objRollup).not.toBeUndefined();
    });

    it('should check content download progress', () => {
        let mockData = mockRes.importContentDownloadProgressResponse;
        spyOn(component, 'subscribeGenieEvent').and.callThrough();
        const event = TestBed.get(Events);
        spyOn(event, 'subscribe').and.callFake(function ({ }, success) {
            return success(JSON.stringify(mockData));
        });
        component.cardData = {};
        component.subscribeGenieEvent();
        expect(component.subscribeGenieEvent).toBeDefined();
        expect(component.subscribeGenieEvent).toHaveBeenCalled();
        expect(event.subscribe).toHaveBeenCalled();
        expect(component.downloadProgress).toEqual(mockData.data.downloadProgress);
    });
});
