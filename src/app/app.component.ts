import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Button, ButtonDirective} from "primeng/button";
import {TableModule} from "primeng/table";
import {SkeletonModule} from "primeng/skeleton";
import {Product} from "./models/product";
import {ProductService} from "./services/product.service";
import {NgForOf, NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {ToolbarModule} from "primeng/toolbar";
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {PaginatorModule} from "primeng/paginator";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ProgressSpinnerModule} from "primeng/progressspinner";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonDirective, TableModule, SkeletonModule, NgForOf, Button, DialogModule, FormsModule, ToolbarModule, ToastModule, NgIf, PaginatorModule, InputTextModule, InputTextareaModule, ConfirmDialogModule, ProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class AppComponent implements OnInit {
  products: Product[] = [];
  product!: Product;
  productDialog: boolean = false;
  submitted: boolean = false;
  loading: boolean = true;


  constructor(private productService: ProductService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.loadProducts();
  }

  openNew() {
    this.submitted = false;
    this.product = {} as Product;
    this.productDialog = true;
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      data => {
        this.products = data;
        this.loading = false;
      },
      error => {
        console.error('Hubo un error cargando los productos', error);
      }
    );
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm.trim()) {
      this.productService.getProductByName(searchTerm).subscribe(
        data => {
          this.products = data;
        },
        error => {
          console.error('Hubo un error filtrando los productos', error);
        }
      );
    } else {
      this.loadProducts();
    }
  }

  saveProduct() {
    if (!this.product.name || !this.product.description || this.product.price == null || this.product.quantity == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios y el precio debe ser mayor o igual a 0',
        life: 3000
      });
      return;
    }

    if (this.product.price < 0 || this.product.quantity < 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El precio y la cantidad deben ser mayores o iguales a 0',
        life: 3000
      });
      return;
    }

    if (this.product.id) {
      this.productService.updateProduct(this.product.id, this.product).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex((p) => p.id === updatedProduct.id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Producto Actualizado',
            life: 3000
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el producto',
            life: 3000
          });
        }
      });
    } else {
      this.productService.createProduct(this.product).subscribe({
        next: (newProduct) => {
          this.products.unshift(newProduct);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Producto Creado',
            life: 3000
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el producto',
            life: 3000
          });
        }
      });
    }

    this.productDialog = false;
  }

  editProduct(id: number) {
    this.productService.getProductById(id).subscribe(
      data => {
        this.product = data;
        this.productDialog = true;
      },
      error => {
        console.error('No se pudo editar el producto', error);
      }
    );
  }

  deleteProduct(product: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el producto ' + product.name + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.products = this.products.filter((val) => val.id !== product.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Producto Eliminado',
              life: 3000
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el producto',
              life: 3000
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }
}
