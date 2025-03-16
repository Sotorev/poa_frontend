"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Video } from "lucide-react"
import Link from "next/link"

// Definición de tipos para mejor mantenibilidad
interface ResourceLink {
  title: string
  url: string
  description?: string
}

interface UserRoleSection {
  id: string
  title: string
  documents: ResourceLink[]
  videos: ResourceLink[]
}

/*
  {
    title: "Tutorial: Vinculación con PEI",
    url: "#",
    description: "Cómo vincular actividades con el Plan Estratégico Institucional",
  },
*/

// Datos de ejemplo - Estos pueden ser fácilmente actualizados o cargados desde una API
const userManualData: UserRoleSection[] = [
  {
    id: "dean-director",
    title: "Decano/Director",
    documents: [
      {
        title: "Guia para marcar un evento como ejecutado (en progreso)",
        url: "https://umesedugt-my.sharepoint.com/:b:/g/personal/rubenrobles_umes_edu_gt/Eb03b6EfG_tLqR-dBsl6qjIBksXjFtz3yI_e4_NuOK8r7w?e=5ZMZAS",
        description: "Marcarlo como ejecutado, editarlo, regresarlo al estado planificado, etc.",
      },
    ],
    videos: [
      {
        title: "Gestión del POA y creación de eventos",
        url: "https://umesedugt-my.sharepoint.com/:v:/g/personal/rubenrobles_umes_edu_gt/ETuqgouBeYdMja4WGTsyUToBCrUEDm3_1_EXZrn1kwut2Q?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=QctKcC",
        description: "Gestion de las secciones del POA, envio del POA para aprobación y creación de eventos",
      },
    ],
  },
  {
    id: "formulator",
    title: "Formulador",
    documents: [
      {
        title: "Guia para marcar un evento como ejecutado (en progreso)",
        url: "https://umesedugt-my.sharepoint.com/:b:/g/personal/rubenrobles_umes_edu_gt/Eb03b6EfG_tLqR-dBsl6qjIBksXjFtz3yI_e4_NuOK8r7w?e=5ZMZAS",
        description: "Marcarlo como ejecutado, editarlo, regresarlo al estado planificado, etc.",
      },
    ],
    videos: [
      {
        title: "Creación de eventos",
        url: "https://umesedugt-my.sharepoint.com/:v:/g/personal/rubenrobles_umes_edu_gt/ETuqgouBeYdMja4WGTsyUToBCrUEDm3_1_EXZrn1kwut2Q?nav=eyJwbGF5YmFja09wdGlvbnMiOnsic3RhcnRUaW1lSW5TZWNvbmRzIjoxODExLjY3MSwidGltZXN0YW1wZWRMaW5rUmVmZXJyZXJJbmZvIjp7InNjZW5hcmlvIjoiQ2hhcHRlclNoYXJlIiwiYWRkaXRpb25hbEluZm8iOnsiaXNTaGFyZWRDaGFwdGVyQXV0byI6ZmFsc2V9fX0sInJlZmVycmFsSW5mbyI6eyJyZWZlcnJhbEFwcCI6IlN0cmVhbVdlYkFwcCIsInJlZmVycmFsVmlldyI6IlNoYXJlQ2hhcHRlckxpbmsiLCJyZWZlcnJhbEFwcFBsYXRmb3JtIjoiV2ViIiwicmVmZXJyYWxNb2RlIjoidmlldyJ9fQ&e=Se1oLx",
        description: "Pasos para crear, editar y eliminar eventos",
      },
    ],
  },
  {
    id: "vice-rectors",
    title: "Vicerrectores",
    documents: [
      {
        title: "Guia para la aprobación de POA",
        url: "https://umesedugt-my.sharepoint.com/:b:/g/personal/rubenrobles_umes_edu_gt/Ee3WefFqsbBBgfXpW2ZHB6cBAyH1ABBjha2HAgswHZrnBQ?e=wixB05",
        description: "Visualización y aprobación de POA",
      },
    ],
    videos: [
    ],
  },
  {
    id: "coordinator",
    title: "Coordinador pedagógico",
    documents: [
      {
        title: "Guia para la aprobación de POA",
        url: "https://umesedugt-my.sharepoint.com/:b:/g/personal/rubenrobles_umes_edu_gt/Ee3WefFqsbBBgfXpW2ZHB6cBAyH1ABBjha2HAgswHZrnBQ?e=wixB05",
        description: "Visualización y aprobación de POA",
      },
    ],
    videos: [
      {
        title: "Gestión del POA y creación de eventos",
        url: "https://umesedugt-my.sharepoint.com/:v:/g/personal/rubenrobles_umes_edu_gt/ETuqgouBeYdMja4WGTsyUToBCrUEDm3_1_EXZrn1kwut2Q?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=QctKcC",
        description: "Gestion de las secciones del POA, envio del POA para aprobación y creación de eventos",
      },
    ],
  },
  {
    id: "administrative",
    title: "Administrador",
    documents: [
      {
        title: "Gestión de facultades en el sistema",
        url: "https://umesedugt-my.sharepoint.com/:b:/g/personal/rubenrobles_umes_edu_gt/ERVnLloZy1pDgnMOugdOuEIBzPlNh63nQHOxoHi8GMB8kw?e=350xwF",
        description: "Manual general para todos los usuarios del sistema",
      },
    ],
    videos: [
      {
        title: "Gestión del POA y creación de eventos",
        url: "https://umesedugt-my.sharepoint.com/:v:/g/personal/rubenrobles_umes_edu_gt/ETuqgouBeYdMja4WGTsyUToBCrUEDm3_1_EXZrn1kwut2Q?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=QctKcC",
        description: "Gestion de las secciones del POA, envio del POA para aprobación y creación de eventos",
      },
    ],
  },
]

export default function ManualesDeUsuario() {
  const [expandedSection, setExpandedSection] = useState<string | undefined>(undefined)

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl font-bold text-primary">Manuales de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-6">
            Seleccione su rol para acceder a los manuales y videos instructivos correspondientes.
          </p>

          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={expandedSection}
            onValueChange={setExpandedSection}
          >
            {userManualData.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-md mb-4 border-border">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 rounded-t-md">
                  <span className="text-lg font-medium">{section.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <Tabs defaultValue="documents" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="documents" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Documentos</span>
                      </TabsTrigger>
                      <TabsTrigger value="videos" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Videos</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="documents" className="mt-0">
                      {section.documents.length > 0 ? (
                        <ul className="space-y-3">
                          {section.documents.map((doc, index) => (
                            <li key={index} className="border-l-2 border-primary pl-4 py-1">
                              <Link
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium block"
                              >
                                {doc.title}
                              </Link>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No hay documentos disponibles para este rol.</p>
                      )}
                    </TabsContent>

                    <TabsContent value="videos" className="mt-0">
                      {section.videos.length > 0 ? (
                        <ul className="space-y-3">
                          {section.videos.map((video, index) => (
                            <li key={index} className="border-l-2 border-primary pl-4 py-1">
                              <Link
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium block"
                              >
                                {video.title}
                              </Link>
                              {video.description && (
                                <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No hay videos disponibles para este rol.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">¿No encuentra lo que busca?</h3>
        <p className="text-sm text-muted-foreground">
          Si necesita ayuda adicional o no encuentra el manual que necesita, por favor contactenos.
        </p>
      </div>
    </div>
  )
}