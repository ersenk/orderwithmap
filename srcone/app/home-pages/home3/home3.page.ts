import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Events, IonSlides, Platform, MenuController, ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ConfigService } from 'src/providers/config/config.service';
import { Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { LoginPage } from '../../modals/login/login.page';
@Component({
  selector: 'app-home3',
  templateUrl: './home3.page.html',
  styleUrls: ['./home3.page.scss'],
})
export class Home3Page implements OnInit, AfterViewInit {
  sliderConfig = {
    slidesPerView: 1.7,
    spaceBetween: 16
  };
  campaigns = [];
  backButtonSubscription;
  counter: number = 0;
  constructor(
    public nav: NavController,
    public config: ConfigService,
    public events: Events,
    public shared: SharedDataService,
    public plt: Platform,
    public router: Router,
    public menuCtrl: MenuController,
    public ga: GoogleAnalytics,
    public modalCtrl: ModalController
  ) { }
  openProducts(value) {
    this.nav.navigateForward("/products/0/0/" + value);
  }
  openCategories(id, name, value) {
    this.ga.trackEvent('Kategori', 'Kategori Tıklama', 'Kategori Adı: ' + name, 0);
    this.nav.navigateForward("app/products/" + id + "/" + name + "/" + value);
  }
  ngOnInit() {
    this.customerHasDeliveryOnRoad();
    this.ga.trackView('Mobil Anasayfa').then(() => {
    });
    if (this.shared.customerData != null) {
      this.ga.setUserId(this.shared.customerData.customers_firstname + ' ' + this.shared.customerData.customers_lastname);
    }
  }
  openCampaign(slug, name) {
    this.ga.trackEvent('Kampanya', 'Kampanya Tıklama', 'Kampanya Adı: ' + name, 0);
    this.nav.navigateForward("campaign/" + slug);
  }
  ngAfterViewInit() {
    this.backButtonSubscription = this.plt.backButton.subscribe(() => {
      if (this.shared.currentOpenedModel != null) {
        this.shared.currentOpenedModel.dismiss();
        this.shared.currentOpenedModel = null;
      } else {
        if (this.router.url.includes('home3')) {
          if (this.counter == 0) {
            this.shared.toast('Çıkmak için bir kez daha dokunun');
            this.counter++;
          } else if (this.counter > 0) {
            navigator['app'].exitApp();
          }
          setTimeout(() => {
            this.counter = 0;
          }, 2000);
        } else {
          window.history.back();
        }
      }
    });
  }

  doRefresh(event) {
    this.shared.onStart();
    this.customerHasDeliveryOnRoad();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
  hideCartPopoup(e) {
    if (!e.target.classList.contains('cart-pop-up')) {
      this.shared.isCartPopUpOpen.next(false);
    } else {
      this.shared.isCartPopUpOpen.next(true);
    }
  }
  hideCartPopoupScroll(e) {
    if (!e.target.classList.contains('cart-pop-up')) {
      this.shared.isCartPopUpOpen.next(false);
    }
  }
  async goToMyAdresses() {
    if (this.shared.customerData.customers_id == null || this.shared.customerData.customers_id == undefined) {
      let modal = await this.modalCtrl.create({
        component: LoginPage
      });
      return await modal.present();
    }
    else {
      this.nav.navigateForward('/addresses');
    }
  }
  goToMyWishList() {
    this.nav.navigateForward('app/wish-list');
  }
  async customerHasDeliveryOnRoad() {
    let data = { customers_id: this.shared.customerData.customers_id }
    await this.config.postHttp('doihavedeliveryonroad', data).then( (response: any) => {
      if (response.success == 1) {
        this.shared.customerWaitingForDelivery.next(true);
      } else {
        this.shared.customerWaitingForDelivery.next(false);
      }
    });
  }
}