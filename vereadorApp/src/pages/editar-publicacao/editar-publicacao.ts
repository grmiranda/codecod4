import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
import { Publicacao } from '../../model/publicacao';
import { PublicacaoService } from '../../providers/publicacao-service';
import { FotoService } from '../../providers/foto-service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { PublicacaoPage } from '../publicacao/publicacao';

@Component({
  selector: 'page-editar-publicacao',
  templateUrl: 'editar-publicacao.html'
})
export class EditarPublicacaoPage {

  public publicacao: Publicacao = new Publicacao();
  public desabilitar = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private domSanitizer: DomSanitizer,
    public fotoService: FotoService,
    public publicacaoService: PublicacaoService,
    private toastCtrl: ToastController
  ) {
    this.publicacao = this.navParams.get("publicacao");
    this.converterVideoURL(this.publicacao.video);
  }

  private editar() {
    this.desabilitar = true;
    this.publicacaoService.editPublicacao(this.publicacao).then(res => {
      if (!res.error) {
        if (res.value) {
          this.navCtrl.pop();
          this.navCtrl.pop();
          this.navCtrl.push(PublicacaoPage, { publicacao: this.publicacao });
          this.presentToast("Alterado com sucesso");
        }
      } else {
        this.showConfirm();
      }
    }).catch(()=>this.desabilitar = false);
  }

  private addLink() {
    let prompt = this.alertCtrl.create({
      title: 'YouTube',
      message: "Insira a url do vídeo do YouTube",
      inputs: [
        {
          name: 'link',
          placeholder: 'Link'
        },
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {

            this.publicacao.fotoURL = [];

            this.converterVideoURL(data.link);
          }
        }
      ]
    });
    prompt.present();
  }

  private importarFoto() {
    this.fotoService.importarFoto().then(url => {
      if (url !== "false") {
        this.publicacao.fotoURL.push(url);
      }
    });
  }

  private converterVideoURL(link) {
    if (link.includes('https://youtu.be/')) {
      this.publicacao.video = link.replace("https://youtu.be/", "https://www.youtube.com/embed/");
      this.publicacao.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.publicacao.video);
    }
    else if (link.includes('watch?v=')) {
      this.publicacao.video = link.replace("watch?v=", "embed/");
      this.publicacao.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.publicacao.video);
    } else if (link.includes('embed/')) {
      this.publicacao.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.publicacao.video);
    }
  }

  private opcaoApagar(url) {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Remover foto " + (this.publicacao.fotoURL.indexOf(url) + 1),
      buttons: [
        {
          text: 'Remover Foto',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.removerFoto(url);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }

  opcaoAdd() {
    let semFoto = this.actionSheetCtrl.create({
      title: "Adicionar",
      buttons: [
        {
          text: 'Foto da galeria',
          role: 'destructive',
          icon: 'md-image',
          handler: () => {
            this.importarFoto();
          }
        },
        {
          text: 'Foto da câmera',
          role: 'destructive',
          icon: 'md-camera',
          handler: () => {
            this.tirarFoto();
          }
        },
        {
          text: 'Vídeo',
          role: 'destructive',
          icon: 'logo-youtube',
          handler: () => {
            this.addLink();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    semFoto.present();
  }

  private tirarFoto() {
    this.fotoService.tirarFoto().then(url => {
      if (url !== "false") {
        this.publicacao.fotoURL.push(url);
      }
    });
  }

  private removerFoto(url: string) {
    let index = this.publicacao.fotoURL.indexOf(url);
    if (index == 0) {
      this.publicacao.fotoURL.shift();
    } else if (index > 0) {
      this.publicacao.fotoURL.splice(index, 1);
    }
  }

  private removerVideo() {
    this.publicacao.video = "";
  }

  private showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Falha na conexão',
      message: 'Tentar Novamente ?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.desabilitar =false;
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.editar();
          }
        }
      ]
    });
    confirm.present();
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
