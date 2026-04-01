import { Component, ViewChild, OnInit, Injector, Input, ChangeDetectorRef, HostListener, ComponentFactoryResolver, ApplicationRef, TemplateRef, ComponentRef } from '@angular/core';
import { ComponentPortal, ComponentType, DomPortalOutlet } from '@angular/cdk/portal';
import { UserSignatureComponent } from '../../user/user-signature/user-signature.component';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    standalone: false
})

export class DialogComponent implements OnInit {
  elementContainer: DomPortalOutlet;

  title!: string;
  showToolbar!: boolean;
  showPadding!: boolean;
  componentInnerInstance;

  constructor(private resolver: ComponentFactoryResolver, private injector: Injector, private app: ApplicationRef) { }

  ngOnInit(): void { }

  attachComponentInner<T>(componentInnerType: ComponentType<T>) {
    let contentElementList = document.querySelectorAll("div#f4ns-dialog-content");
    //
    this.elementContainer = new DomPortalOutlet(
      contentElementList[contentElementList.length - 1],
      this.app,
      this.injector);
    const componentInnerRef = this.elementContainer.attach(new ComponentPortal(componentInnerType));
    //
    this.componentInnerInstance = componentInnerRef.instance;
  }
}
