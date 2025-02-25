import { Component } from '@angular/core';
import { ActionSheetController, NavParams, ToastController, AlertController, LoadingController, MenuController, Platform } from 'ionic-angular';
import { Depoimento } from '../../model/depoimento';
import { DepoimentoService } from '../../providers/depoimento-service';
import { BadgesService } from '../../providers/badges-service';
import { StorageService } from '../../providers/storage';
@Component({
  selector: 'page-avaliar-depoimento',
  templateUrl: 'avaliar-depoimento.html'
})
export class AvaliarDepoimentoPage {

  private depoimentos: Depoimento[] = [];

  constructor(
    private toastCtrl: ToastController,
    public loadingController: LoadingController,
    private platform: Platform,
    private depoimentoService: DepoimentoService,
    private menuCtrl: MenuController,
    private alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public badgesService: BadgesService,
    public storageService: StorageService
  ) {
  }

  ionViewDidEnter() {
    this.carregarDepoimentos();

  }

  private carregarDepoimentos() {
    this.storageService.get().then(res => {
      this.badgesService.publicar(res.IDUsuario);
    });
    let loader = this.loadingController.create({
      content: "Carregando avaliações"
    });

    loader.present();

    this.depoimentoService.getDepoimentoAvaliar().then(depoimentos => {
      loader.dismiss();
      if (!depoimentos.error) {
        this.depoimentos = depoimentos.data;
      }else{
        this.tentarNovamente();
      }
    });
  }

  private abrirOpcoes(depoimento: any) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opções',
      buttons: [
        {
          text: 'Negar',
          role: 'destructive',
          icon: !this.platform.is('trash') ? 'trash' : null,
          handler: () => {
            this.depoimentoService.negar(depoimento.IDDepoimento).then(res => {
              if (res == true) {
                this.carregarDepoimentos();
                this.presentToast("Depoimento aprovado com sucesso");
              } else {
                this.presentToast("Depoimento não aprovado sucesso");
              }
            });
          }
        },
        {
          text: 'Aprovar',
          icon: !this.platform.is('ios') ? 'checkmark-circle' : null,

          handler: () => {
            this.depoimentoService.aprovar(depoimento.IDDepoimento).then(res => {
              if (res == true) {
                this.carregarDepoimentos();
                this.presentToast("Depoimento aprovado com sucesso");
              } else {
                this.presentToast("Depoimento não aprovado sucesso");
              }
            });
          }
        },
        {
          text: 'Cancel',
          icon: !this.platform.is('close') ? 'trash' : null,
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }

  private doRefresh(refresher) {
    this.depoimentoService.getDepoimentoAvaliar().then(depoimentos => {
      refresher.complete();
      if (!depoimentos.error) {
        this.depoimentos = depoimentos.data;
      }else{
        this.tentarNovamente();
      }
    });
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  private tentarNovamente() {
    let confirm = this.alertCtrl.create({
      title: 'Falha na conexão',
      message: 'Tentar Novamente ?',
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Ok',
          handler: () => {
            this.carregarDepoimentos();
          }
        }
      ]
    });
    confirm.present();
  }

  private toggleMenu() {
    this.menuCtrl.toggle();
  }

}
