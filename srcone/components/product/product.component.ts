import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ToastController, Events, ModalController, NavController } from '@ionic/angular';
import { ConfigService } from 'src/providers/config/config.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LoginPage } from 'src/app/modals/login/login.page';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
@Component({
  selector: 'app-product',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {

  @Input('data') p;
  @Input('type') type;
  loaded;
  expired = false;
  is_upcomming = false;
  basketQuantity: number = 0;
  isCalculatingTotalPrice: boolean = false;
  toggleCartComponent: boolean = false;
  products_id;
  constructor(
    public config: ConfigService,
    public shared: SharedDataService,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public events: Events,
    public loading: LoadingService,
    public ga: GoogleAnalytics,
    public storage: Storage
  ) {
    events.subscribe('wishListUpdate', (id, value) => {
      if (this.p.products_id == id) { this.p.isLiked = value }
    });
    events.subscribe('productExpired', (id) => {
      if (this.p.products_id == id) { this.productExpired(); }
    });
    this.shared.isCartPopUpOpen.subscribe(cartpopoup => {
      if (!cartpopoup) {
        this.toggleCartComponent = false;
      }
    });
  }
  productExpired() {
    this.expired = true
  }

  pDiscount() {
    var rtn = "";
    var p1 = parseInt(this.p.products_price);
    var p2 = parseInt(this.p.discount_price);
    if (p1 == 0 || p2 == null || p2 == undefined || p2 == 0) { rtn = ""; }
    var result = Math.abs((p1 - p2) / p1 * 100);
    result = parseInt(result.toString());
    if (result == 0) { rtn = "" }
    rtn = result + '%';
    return rtn;
  }

  showProductDetail() {
    if (this.type == 'flash') {
      this.loading.show();
      var dat: { [k: string]: any } = {};
      if (this.shared.customerData != null) {
        dat.customers_id = this.shared.customerData.customers_id;
      }
      else {
        dat.customers_id = null;
      }
      dat.products_id = this.p.products_id;
      dat.language_id = this.config.langId;
      dat.currency_code = this.config.currecnyCode;
      dat.type = 'flashsale';
      this.config.postHttp('getallproducts', dat).then((data: any) => {
        this.loading.hide();
        if (data.success == 1) {
          this.shared.singleProductPageData.push(data.product_data[0]);
          this.ga.trackEvent('Ürün Detay', 'Ürün Detayı Tıklama', 'ürün Adı: ' + this.p.products_name, 0);
          this.navCtrl.navigateForward("product-detail/" + this.p.products_id);
        }
      }, err => {
      });
    }
    else {
      this.shared.singleProductPageData.push(this.p);
      this.navCtrl.navigateForward("product-detail/" + this.p.products_id);
    }
    if (this.type != 'recent' && this.type != 'flash') { this.shared.addToRecent(this.p); }
  }

  checkProductNew() {
    var pDate = new Date(this.p.products_date_added);
    var date = pDate.getTime() + this.config.newProductDuration * 86400000;
    var todayDate = new Date().getTime();
    if (date > todayDate) {
      return true;
    }
    else {
      return false
    }
  }

  addToCart() {
    this.shared.addToCart(this.p, []);
    this.toggleCartComponent = true;
    this.basketQuantity = this.p.products_min_order;
  }

  removeCart() {
    for (let value of this.shared.cartProducts) {
      if (value.products_id == this.p.products_id) {
        this.shared.removeCart(value.cart_id);
      }
    }
    this.toggleCartComponent = false;
  }
  isInCart() {
    var found = false;
    for (let value of this.shared.cartProducts) {
      if (value.products_id == this.p.products_id) { found = true; }
    }

    if (found == true) { return true; }
    else { return false; }
  }
  removeRecent() {
    this.shared.removeRecent(this.p);
  }

  async clickWishList() {
    if (this.shared.customerData.customers_id == null || this.shared.customerData.customers_id == undefined) {
      let modal = await this.modalCtrl.create({
        component: LoginPage
      });
      await modal.present();
    }
    else {
      if (this.p.isLiked == '0') {
        this.addWishList();
        this.shared.toast('Alışveriş listenize eklendi');
      } else {
        this.removeWishList();
        this.shared.toast('Alışveriş listenizden kaldırıldı');
      }
    }
  }
  addWishList() {
    this.shared.addWishList(this.p);
  }
  removeWishList() {
    this.shared.removeWishList(this.p);
  }
  basketQuantityOfProduct() {
    for (let value of this.shared.cartProducts) {
      if (value.products_id == this.p.products_id) {
        this.basketQuantity = value.customers_basket_quantity;
      }
    }
  }
  qunatityMinus() {
    let product;
    for (let index = 0; index < this.shared.cartProducts.length; index++) {
      if (this.p.products_id == this.shared.cartProducts[index].products_id) {
        if (this.shared.cartProducts[index].customers_basket_quantity == 1) {
          return 0;
        } else if (this.shared.cartProducts[index].customers_basket_quantity <= this.shared.cartProducts[index].products_min_order) {
          this.shared.showAlert('Bu üründen en az ' + this.shared.cartProducts[index].customers_basket_quantity + ' adet sipariş verebilirsiniz');
          return 0;
        }
        product = this.shared.cartProducts[index];
        this.isCalculatingTotalPrice = true;
        this.shared.cartProducts[index].customers_basket_quantity--;
        this.isCalculatingTotalPrice = false;
      }
    }
    this.storage.set('cartProducts', this.shared.cartProducts);
    this.basketQuantityOfProduct();
  }
  qunatityPlus() {
    let product;
    for (let index = 0; index < this.shared.cartProducts.length; index++) {
      if (this.p.products_id == this.shared.cartProducts[index].products_id) {
        product = this.shared.cartProducts[index];
        if (product.products_max_stock > 0 && product.customers_basket_quantity >= product.products_max_stock) {
          this.shared.showAlert('Bu üründen en fazla ' + product.customers_basket_quantity + ' adet sipariş verebilirsiniz');
          return 0;
        }
        this.isCalculatingTotalPrice = true;
        this.shared.cartProducts[index].customers_basket_quantity++;
        this.isCalculatingTotalPrice = false;
      }
    }
    this.storage.set('cartProducts', this.shared.cartProducts);
    this.basketQuantityOfProduct();
  }
  ngOnInit() {
    this.basketQuantityOfProduct();
    this.products_id = this.p.products_id
  }
  toggleCartPopUp() {
    if (this.toggleCartComponent) {
      this.toggleCartComponent = false;
    } else {
      this.toggleCartComponent = true;
    }
  }
  
}
